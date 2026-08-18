import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "child_process";

/**
 * Integration test against a real Postgres (via Testcontainers). The
 * product-service HTTP boundary (utils/product-client.ts) is mocked rather
 * than run for real — order-service's own responsibility is the order/stock
 * *orchestration* logic, which this test exercises against a real database;
 * product-service's own stock logic has its own integration test.
 */
jest.mock("../../src/utils/product-client", () => ({
  getProductById: jest.fn(),
  reserveStock: jest.fn(),
  releaseStock: jest.fn(),
}));

describe("OrderService integration", () => {
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();

    process.env.NODE_ENV = "test";
    process.env.ORDER_DATABASE_URL = container.getConnectionUri();
    process.env.JWT_ACCESS_SECRET = "integration-test-access-secret";
    process.env.PRODUCT_SERVICE_URL = "http://localhost:4002";
    process.env.ORDER_RESERVATION_TTL_MINUTES = "15";

    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });
  }, 120_000);

  afterAll(async () => {
    await container.stop();
  });

  const user = { id: "22222222-2222-2222-2222-222222222222", email: "buyer@example.com", role: "CUSTOMER" };
  const productId = "33333333-3333-3333-3333-333333333333";

  it("creates an order, reserving stock via product-client", async () => {
    const productClient = await import("../../src/utils/product-client");
    (productClient.getProductById as jest.Mock).mockResolvedValue({
      id: productId,
      name: "Test Widget",
      price: "19.99",
      stock: 10,
      isActive: true,
    });
    (productClient.reserveStock as jest.Mock).mockResolvedValue(undefined);

    const { OrderService } = await import("../../src/services/order.service");
    const orderService = new OrderService();

    const order = await orderService.create({ items: [{ productId, quantity: 2 }] }, user);

    expect(order.status).toBe("PENDING");
    expect(order.totalAmount.toString()).toBe("39.98");
    expect(productClient.reserveStock).toHaveBeenCalledWith(productId, 2);
  });

  it("rolls back earlier reservations when a later item in the order fails", async () => {
    const productClient = await import("../../src/utils/product-client");
    const productA = "44444444-4444-4444-4444-444444444444";
    const productB = "55555555-5555-5555-5555-555555555555";

    (productClient.getProductById as jest.Mock).mockImplementation(async (id: string) => ({
      id,
      name: id === productA ? "Product A" : "Product B",
      price: "10.00",
      stock: 5,
      isActive: true,
    }));
    (productClient.reserveStock as jest.Mock).mockImplementation(async (id: string) => {
      if (id === productB) throw new Error("Insufficient stock for product B");
    });
    (productClient.releaseStock as jest.Mock).mockResolvedValue(undefined);

    const { OrderService } = await import("../../src/services/order.service");
    const orderService = new OrderService();

    await expect(
      orderService.create(
        {
          items: [
            { productId: productA, quantity: 1 },
            { productId: productB, quantity: 1 },
          ],
        },
        user
      )
    ).rejects.toThrow(/insufficient stock/i);

    // Product A's reservation must be released since product B's failed.
    expect(productClient.releaseStock).toHaveBeenCalledWith(productA, 1);
  });

  it("expires unpaid orders past their reservation window and releases stock", async () => {
    const productClient = await import("../../src/utils/product-client");
    (productClient.getProductById as jest.Mock).mockResolvedValue({
      id: productId,
      name: "Test Widget",
      price: "19.99",
      stock: 10,
      isActive: true,
    });
    (productClient.reserveStock as jest.Mock).mockResolvedValue(undefined);
    (productClient.releaseStock as jest.Mock).mockClear().mockResolvedValue(undefined);

    const { OrderService } = await import("../../src/services/order.service");
    const { prisma } = await import("../../src/config/prisma");
    const orderService = new OrderService();

    const order = await orderService.create({ items: [{ productId, quantity: 1 }] }, user);

    // Backdate the reservation window directly rather than waiting real
    // time out, so the expiry job picks it up on the next run.
    await prisma.order.update({
      where: { id: order.id },
      data: { reservationExpiresAt: new Date(Date.now() - 60_000) },
    });

    const expiredCount = await orderService.expirePendingOrders();
    expect(expiredCount).toBeGreaterThanOrEqual(1);

    const afterExpiry = await orderService.getById(order.id, user);
    expect(afterExpiry.status).toBe("CANCELLED");
    expect(productClient.releaseStock).toHaveBeenCalledWith(productId, 1);
  });
});

import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { execSync } from "child_process";

/**
 * Real integration test against a live Postgres + Redis (both via
 * Testcontainers) and the actual repository/service code. Requires Docker.
 * See auth-service's equivalent test for the general pattern this follows.
 */
describe("ProductService integration", () => {
  let pgContainer: StartedPostgreSqlContainer;
  let redisContainer: StartedTestContainer;

  beforeAll(async () => {
    [pgContainer, redisContainer] = await Promise.all([
      new PostgreSqlContainer("postgres:16-alpine").start(),
      new GenericContainer("redis:7-alpine").withExposedPorts(6379).start(),
    ]);

    process.env.NODE_ENV = "test";
    process.env.PRODUCT_DATABASE_URL = pgContainer.getConnectionUri();
    process.env.JWT_ACCESS_SECRET = "integration-test-access-secret";
    process.env.REDIS_HOST = redisContainer.getHost();
    process.env.REDIS_PORT = String(redisContainer.getMappedPort(6379));
    process.env.INTERNAL_API_KEY = "integration-test-internal-key";

    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });
  }, 120_000);

  afterAll(async () => {
    await Promise.all([pgContainer.stop(), redisContainer.stop()]);
  });

  const vendor = { id: "11111111-1111-1111-1111-111111111111", email: "vendor@example.com", role: "VENDOR" };

  it("creates a category and a product under it", async () => {
    const { CategoryService } = await import("../../src/services/category.service");
    const { ProductService } = await import("../../src/services/product.service");

    const categoryService = new CategoryService();
    const productService = new ProductService();

    const category = await categoryService.create("Electronics");

    const product = await productService.create(
      {
        name: "Wireless Mouse",
        description: "A perfectly ordinary wireless mouse.",
        price: 29.99,
        stock: 10,
        sku: "MOUSE-001",
        categoryId: category.id,
        images: [],
      },
      vendor
    );

    expect(product.name).toBe("Wireless Mouse");
    expect(product.stock).toBe(10);
  });

  it("reserves stock atomically and rejects over-reservation", async () => {
    const { ProductService } = await import("../../src/services/product.service");
    const productService = new ProductService();

    const { products } = await productService.list({ page: 1, limit: 10 });
    const product = products[0];

    await productService.reserveStock(product.id, 4);
    const afterFirstReserve = await productService.getById(product.id);
    expect(afterFirstReserve.stock).toBe(6);

    // Only 6 left — reserving 7 should fail without changing stock.
    await expect(productService.reserveStock(product.id, 7)).rejects.toThrow(/insufficient stock/i);

    const afterFailedReserve = await productService.getById(product.id);
    expect(afterFailedReserve.stock).toBe(6);
  });

  it("releases stock back after a reservation is undone", async () => {
    const { ProductService } = await import("../../src/services/product.service");
    const productService = new ProductService();

    const { products } = await productService.list({ page: 1, limit: 10 });
    const product = products[0];
    const stockBefore = product.stock;

    await productService.reserveStock(product.id, 2);
    await productService.releaseStock(product.id, 2);

    const after = await productService.getById(product.id);
    expect(after.stock).toBe(stockBefore);
  });

  it("prevents concurrent reservations from over-selling the same product", async () => {
    const { ProductService } = await import("../../src/services/product.service");
    const { CategoryService } = await import("../../src/services/category.service");
    const productService = new ProductService();
    const categoryService = new CategoryService();

    const category = await categoryService.create("Limited Drops");
    const product = await productService.create(
      {
        name: "Rare Sneaker",
        description: "Only a few pairs exist.",
        price: 199.99,
        stock: 5,
        sku: "SNEAKER-001",
        categoryId: category.id,
        images: [],
      },
      vendor
    );

    // Fire 10 concurrent reservations of 1 unit each against 5 in stock.
    // The atomic conditional-update in tryDecrementStock should mean exactly
    // 5 succeed and 5 fail — never more stock reserved than existed.
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => productService.reserveStock(product.id, 1))
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    expect(succeeded).toBe(5);

    const finalProduct = await productService.getById(product.id);
    expect(finalProduct.stock).toBe(0);
  });
});

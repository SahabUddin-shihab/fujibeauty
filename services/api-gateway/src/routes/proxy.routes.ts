import { Express } from "express";
import proxy from "express-http-proxy";
import { serviceRegistry } from "../config/env";
import { createLogger } from "@ecommerce/logger";
import { env } from "../config/env";

const logger = createLogger({ serviceName: env.SERVICE_NAME });

/**
 * Maps public gateway path prefixes to internal service base URLs.
 * e.g. /api/v1/auth/**  -> AUTH_SERVICE_URL/api/v1/auth/**
 */
const ROUTE_PREFIXES: Record<keyof typeof serviceRegistry, string> = {
  auth: "/api/v1/auth",
  users: "/api/v1/users",
  products: "/api/v1/products",
  categories: "/api/v1/categories",
  inventory: "/api/v1/inventory",
  cart: "/api/v1/cart",
  wishlist: "/api/v1/wishlist",
  orders: "/api/v1/orders",
  payments: "/api/v1/payments",
  notifications: "/api/v1/notifications",
  emails: "/api/v1/emails",
  recommendations: "/api/v1/recommendations",
  search: "/api/v1/search",
  admin: "/api/v1/admin"
};

export function mountProxyRoutes(app: Express): void {
  for (const [name, baseUrl] of Object.entries(serviceRegistry)) {
    const prefix = ROUTE_PREFIXES[name];

    if (!baseUrl) {
      // Service not deployed yet: return a clear 503 instead of a silent proxy failure.
      app.use(prefix, (_req, res) => {
        res.status(503).json({
          error: { code: "SERVICE_UNAVAILABLE", message: `${name} service is not yet deployed` }
        });
      });
      continue;
    }

    app.use(
      prefix,
      proxy(baseUrl, {
        proxyReqPathResolver: (req) => `${prefix}${req.url}`,
        proxyErrorHandler: (err, res) => {
          logger.error(`Upstream error proxying to ${name}`, { error: err.message });
          res.status(502).json({ error: { code: "BAD_GATEWAY", message: `${name} service is unreachable` } });
        },
        timeout: 15_000
      })
    );

    logger.info(`Mounted proxy: ${prefix} -> ${baseUrl}`);
  }
}

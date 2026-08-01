import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { verifyToken } from "./middleware/verify-token";
import { rateLimiter } from "./middleware/rate-limiter";
import { mountProxyRoutes } from "./routes/proxy.routes";
import { serviceRegistry } from "./config/env";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(rateLimiter);

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
      downstream: Object.fromEntries(
        Object.entries(serviceRegistry).map(([name, url]) => [name, url ? "configured" : "not deployed"])
      )
    });
  });

  // Gateway verifies identity before proxying; downstream services never see
  // raw client tokens for protected routes.
  app.use(verifyToken);
  mountProxyRoutes(app);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });

  return app;
}

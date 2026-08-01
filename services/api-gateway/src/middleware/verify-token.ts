import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env, PUBLIC_ROUTES } from "../config/env";

export interface GatewayTokenPayload {
  sub: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | "VENDOR";
}

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((pattern) => pattern.test(path));
}

/**
 * The gateway is the single place that verifies JWTs. Once verified, it
 * injects trusted identity headers (x-user-id, x-user-email, x-user-role)
 * onto the proxied request so downstream services can trust them without
 * re-verifying a token themselves. Downstream services must only be
 * reachable through the gateway's internal network for this trust boundary
 * to hold (enforced by not exposing their ports publicly in docker-compose).
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  if (isPublicRoute(req.path)) {
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token" } });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as GatewayTokenPayload;
    req.headers["x-user-id"] = payload.sub;
    req.headers["x-user-email"] = payload.email;
    req.headers["x-user-role"] = payload.role;
    next();
  } catch {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired access token" } });
  }
}

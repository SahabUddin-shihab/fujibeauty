import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../common/errors";

export interface Identity {
  userId: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | "VENDOR";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      identity?: Identity;
    }
  }
}

/**
 * Downstream services sit behind the API Gateway, which already verified the
 * caller's JWT and injected trusted x-user-* headers. Services trust those
 * headers rather than re-verifying a token, since the gateway is the only
 * component allowed to reach them directly (enforced at the network layer).
 */
export function requireIdentity(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.headers["x-user-id"];
  const email = req.headers["x-user-email"];
  const role = req.headers["x-user-role"];

  if (typeof userId !== "string" || typeof email !== "string" || typeof role !== "string") {
    throw new UnauthorizedError("Missing identity context");
  }

  req.identity = { userId, email, role: role as Identity["role"] };
  next();
}

export function requireRole(...roles: Identity["role"][]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.identity || !roles.includes(req.identity.role)) {
      throw new UnauthorizedError("Insufficient permissions");
    }
    next();
  };
}

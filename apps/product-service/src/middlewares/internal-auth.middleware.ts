import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@fujibeauty/utils";
import { env } from "../config/env";

export function requireInternalApiKey(req: Request, _res: Response, next: NextFunction): void {
  const key = req.headers["x-internal-api-key"];

  if (!key || key !== env.INTERNAL_API_KEY) {
    throw new UnauthorizedError("Missing or invalid internal API key");
  }

  next();
}

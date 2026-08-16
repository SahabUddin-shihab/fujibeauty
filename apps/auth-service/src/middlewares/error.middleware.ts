import { Request, Response, NextFunction } from "express";
import { AppError } from "@fujibeauty/utils";
import { sendError } from "@fujibeauty/utils";
import { logger } from "../config/logger";


export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  logger.error("Unhandled error", { message: err.message, stack: err.stack, path: req.path });
  sendError(res, "Internal server error", 500);
}

export function notFoundMiddleware(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}

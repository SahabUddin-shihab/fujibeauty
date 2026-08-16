import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { sendError } from "@fujibeauty/utils";


export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, "Validation failed", 422, error.flatten().fieldErrors);
      }
      next(error);
    }
  };
}

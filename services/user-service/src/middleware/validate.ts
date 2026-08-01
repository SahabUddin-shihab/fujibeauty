import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

interface ValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

/**
 * Validates and coerces req.body/params/query against Zod schemas.
 * Throws ZodError on failure, caught centrally by the global error handler.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
    if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
    next();
  };
}

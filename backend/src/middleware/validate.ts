import type { Request, Response, NextFunction } from "express";
import { type AnyZodObject } from "zod";

// Augment Express Request to carry validated, type-coerced query/params
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Zod-parsed & coerced query string (replaces raw req.query for validated routes) */
      parsedQuery: Record<string, unknown>;
    }
  }
}

export function validate(schema: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        // req.query is read-only in Express — store parsed result on req.parsedQuery
        req.parsedQuery = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}


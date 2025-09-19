import { ZodError, type ZodTypeAny } from "zod";
import type { Request, Response, NextFunction } from "express";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: "BAD_REQUEST",
            issues: err.issues.map((e) => ({
              path: e.path,
              message: e.message,
            })),
          },
        });
      }
      return res
        .status(500)
        .json({ error: { code: "INTERNAL", message: "Validation failed" } });
    }
  };
}


import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import z, { ZodError } from "zod";

export function zodValidatorMiddleware<T>(schema: z.Schema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body); // safe parsing + assign validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorTree = z.treeifyError(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Bad Request: invalid inputs.",
          cause: errorTree,
        });
      }
      next(error);
    }
  };
}

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
        console.log(errorTree);
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Validation failed",
          //   errors: errorTree.properties.map((err) => ({
          //     path: err.path.join("."),
          //     message: err.message,
          //   })),
        });
      }
      next(error);
    }
  };
}

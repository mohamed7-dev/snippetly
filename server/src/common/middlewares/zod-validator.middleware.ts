import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import z, { ZodError } from "zod";
import { ZodSchema } from "zod/v3";

export function zodValidatorMiddleware(
  schema: any,
  dataSource: "Params" | "Query" | "Body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      switch (dataSource) {
        case "Body":
          req.body = (schema as ZodSchema).parse(req.body);
          break;
        case "Params":
          req.params = (schema as ZodSchema).parse(req.params);
          break;
        case "Query":
          req.query = (schema as ZodSchema).parse(req.query);
          break;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorTree = z.treeifyError(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Bad Request: invalid input data.",
          cause: errorTree,
        });
      }
      next(error);
    }
  };
}

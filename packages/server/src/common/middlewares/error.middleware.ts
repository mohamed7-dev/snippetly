import type { NextFunction, Request, Response } from "express";
import { Interceptor } from "./interceptor.middleware";
import { HttpException } from "../lib/exception";
import { StatusCodes } from "http-status-codes";
import { ErrorLogger } from "../logger/utils";
import { LogContextEnum } from "../logger/constants";
import { createErrorResponse } from "@snippetly/common";

export default class ErrorMiddleWare extends Interceptor {
  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);
  }

  static async handleErrors(
    error: HttpException | Error,
    req: Request,
    res: Response
  ) {
    if (error instanceof HttpException) {
      const status: number = error.status || 500;
      const errorSchema = createErrorResponse();
      const { data } = errorSchema.safeParse(error);
      res.status(status).json({ ...data });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Something went wrong.",
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        cause: error.cause ?? null,
      });
      ErrorLogger.logUnhandledError(error, LogContextEnum.SERVER, {
        endpoint: req.path,
        method: req.method,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });
    }
  }
}

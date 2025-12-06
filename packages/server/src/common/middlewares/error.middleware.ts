import type { NextFunction, Request, Response } from "express";
import { Interceptor } from "./interceptor.middleware";
import { HttpException } from "../lib/exception";
import { StatusCodes } from "http-status-codes";
import { ErrorLogger } from "../logger/utils";
import { LogContextEnum } from "../logger/constants";
import { GlobalErrorResponseDto } from "@snippetly/common";
import z from "zod";

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
      const data = {
        type: "error",
        message: error.message,
        status: error.status ?? 500,
        cause: error.cause ?? null,
      } satisfies z.infer<typeof GlobalErrorResponseDto>;
      res.status(data.status).json(data);
    } else {
      const data = {
        type: "error",
        message: error.message,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        cause: error.cause,
      } satisfies z.infer<typeof GlobalErrorResponseDto>;
      res.status(data.status).json(data);
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

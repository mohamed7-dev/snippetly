import { NextFunction, Request, Response } from "express";
import { Interceptor } from "./interceptor.middleware";
import { HttpException } from "../lib/exception";
import { StatusCodes } from "http-status-codes";
import { ErrorLogger } from "../logger-alternative/utils";
import { LogContextEnum } from "../logger-alternative/constants";

export default class ErrorMiddleWare extends Interceptor {
  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);
  }

  static async handleErrors(
    error: HttpException,
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    const status: number = error.status || 500;
    const message: string = error.message || "Something went wrong";
    if (error instanceof HttpException) {
      // check if 400, return cause
      if (error.status === StatusCodes.BAD_REQUEST) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message, cause: error.cause });
      }
      res.status(status).json({ message });
    } else {
      res.status(status).json({ message });
      ErrorLogger.logUnhandledError(error, LogContextEnum.SERVER, {
        endpoint: req.path,
        method: req.method,
        statusCode: status,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });
    }
  }
}

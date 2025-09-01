import { NextFunction, Request, Response } from "express";
import { ErrorLogger } from "../logger";
import { Interceptor } from "./interceptor.middleware";
import { HttpException } from "../lib/exception";

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
      res.status(status).json({ message });
    } else {
      res.status(status).json({ message });
      ErrorLogger.logUnhandledError(error, "Express Error Handler", {
        endpoint: req.path,
        method: req.method,
        statusCode: status,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });
    }
  }
}

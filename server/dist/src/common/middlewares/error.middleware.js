import { Interceptor } from "./interceptor.middleware.js";
import { HttpException } from "../lib/exception.js";
import { StatusCodes } from "http-status-codes";
import { ErrorLogger } from "../logger/utils.js";
import { LogContextEnum } from "../logger/constants.js";
export default class ErrorMiddleWare extends Interceptor {
    constructor(req, res, next){
        super(req, res, next);
    }
    static async handleErrors(error, req, res, _next) {
        const status = error.status || 500;
        const message = error.message;
        if (error instanceof HttpException) {
            // check if 400, return cause
            if (error.status === StatusCodes.BAD_REQUEST) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message,
                    cause: error.cause
                });
            }
            res.status(status).json({
                message
            });
        } else {
            res.status(status).json({
                message: "Something went wrong."
            });
            ErrorLogger.logUnhandledError(error, LogContextEnum.SERVER, {
                endpoint: req.path,
                method: req.method,
                statusCode: status,
                userAgent: req.get("User-Agent"),
                ip: req.ip
            });
        }
    }
}

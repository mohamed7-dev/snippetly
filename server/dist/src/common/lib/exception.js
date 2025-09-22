import { StatusCodes } from "http-status-codes";
export class HttpException extends Error {
    status;
    message;
    cause;
    constructor(status, message, cause){
        super(message);
        this.status = status;
        this.message = message;
        this.cause = JSON.stringify(cause);
    }
}
export class InternalServerError extends HttpException {
    constructor(message, cause){
        super(StatusCodes.INTERNAL_SERVER_ERROR, message ?? "Oops, Something went wrong.", cause);
    }
}

import { StatusCodes } from "http-status-codes";

export class HttpException extends Error {
  public status: number;
  public message: string;
  public cause?: string;

  constructor(status: number, message: string, cause?: object) {
    super(message);
    this.status = status;
    this.message = message;
    this.cause = JSON.stringify(cause);
  }
}

export class InternalServerError extends HttpException {
  constructor(message?: string, cause?: object) {
    super(
      StatusCodes.INTERNAL_SERVER_ERROR,
      message ?? "Oops, Something went wrong.",
      cause
    );
  }
}

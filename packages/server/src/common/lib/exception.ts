import { StatusCodes } from "http-status-codes";

export class HttpException extends Error {
  public status: number;
  public message: string;
  public cause: string | null;

  constructor(status: number, message: string, cause?: object | string) {
    super(message);
    this.status = status;
    this.message = message;
    this.cause = cause
      ? typeof cause === "string"
        ? cause
        : JSON.stringify(cause)
      : null;
  }
}

export class InternalServerError extends HttpException {
  constructor(message?: string, cause?: object | string) {
    super(
      StatusCodes.INTERNAL_SERVER_ERROR,
      message ?? "Oops, Something went wrong.",
      cause
    );
  }
}

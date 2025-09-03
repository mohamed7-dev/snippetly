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

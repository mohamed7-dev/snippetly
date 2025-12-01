import type { NextFunction, Request, Response } from "express";

export class Interceptor {
  protected ip: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(req: Request, _res: Response, _next: NextFunction) {
    this.ip = req.ip ?? "";
  }
}

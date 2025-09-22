import { NextFunction, Request, Response } from "express";

export class Interceptor {
  protected ip: string;

  constructor(req: Request, res: Response, next: NextFunction) {
    this.ip = req.ip ?? "";
  }
}

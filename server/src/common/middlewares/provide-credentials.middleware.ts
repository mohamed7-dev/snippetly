import type { NextFunction, Request, Response } from "express";
import { allowedOrigins } from "../lib/cors";

export function provideCredentialsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
}

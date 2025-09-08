import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { REFRESH_TOKEN_COOKIE_KEY } from "../../modules/auth/constants";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.context.user;
  if (!user || !req.cookies?.[REFRESH_TOKEN_COOKIE_KEY]) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid session info, please login first.",
    });
  }

  next();
}

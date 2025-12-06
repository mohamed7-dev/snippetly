import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { REFRESH_TOKEN_COOKIE_KEY } from "@snippetly/common";
import { UnauthorizedErrorResponseDto } from "@snippetly/common/dto";
import z from "zod";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.context.user;
  if (!user || !req.cookies?.[REFRESH_TOKEN_COOKIE_KEY]) {
    const rawRes = {
      type: "error",
      message: "Invalid session, please login first.",
      status: StatusCodes.UNAUTHORIZED,
      cause: null,
    } satisfies z.infer<typeof UnauthorizedErrorResponseDto>;

    res.status(rawRes.status).json(rawRes);
  }

  next();
}

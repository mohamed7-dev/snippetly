import { BadRequestErrorResponseDto } from "@snippetly/common/dto";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MulterError } from "multer";
import z from "zod";

export function multerErrorMiddleware(
  error: MulterError,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof MulterError) {
    const rawRes = {
      type: "error",
      message: error.message,
      status: StatusCodes.BAD_REQUEST,
      cause: error.cause,
    } satisfies z.infer<typeof BadRequestErrorResponseDto>;

    return res.status(rawRes.status).json(rawRes);
  }

  next(error);
}

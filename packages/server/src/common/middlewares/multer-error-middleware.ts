import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MulterError } from "multer";

export function multerErrorMiddleware(
  error: MulterError,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof MulterError) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }

  next(error);
}

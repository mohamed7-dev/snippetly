import { NextFunction, Request, Response } from "express";
import { HttpException } from "../lib/exception";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    throw new HttpException(StatusCodes.UNAUTHORIZED, "Please, login first.");

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({
          message: "Forbidden: You are not allowed to perform this action.",
        });
    } else {
      req.user = user as unknown as Request["user"];
      next();
    }
  });
}

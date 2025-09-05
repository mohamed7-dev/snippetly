import { NextFunction, Request, Response } from "express";
import { HttpException } from "../lib/exception";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { ACCESS_JWTOKEN_SECRET } from "../../config";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string);

  if (!authHeader || !authHeader.startsWith("Bearer "))
    throw new HttpException(StatusCodes.UNAUTHORIZED, "Please, login first.");

  const token = authHeader.split(" ")[1];

  jwt.verify(token, ACCESS_JWTOKEN_SECRET, (err, user) => {
    if (err) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid session info.",
      });
    } else {
      req.user = user as unknown as Request["user"];
      next();
    }
  });
}

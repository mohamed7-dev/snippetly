import type { NextFunction, Request, Response } from "express";
import { ServerLogger } from "../logger/index.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { ACCESS_JWTOKEN_SECRET } from "../../config/index.ts";
import { type User } from "../db/schema.ts";

export type RequestUser = Pick<User, "email" | "id" | "image" | "name"> &
  JwtPayload;

export type RequestContext = {
  requestId: string;
  user: RequestUser | null;
  req: Request;
  logger: typeof ServerLogger;
};

function extractUserInfo(req: Request): null | RequestUser {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  let userInfo: null | RequestUser = null;
  jwt.verify(token, ACCESS_JWTOKEN_SECRET!, (err, user) => {
    if (err) {
      userInfo = null;
    } else {
      userInfo = user as RequestUser;
    }
  });
  return userInfo;
}

export function requestContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const requestId = crypto.randomUUID();
  // in the controller, we know that protected routes can't reach
  // the point of accessing the user object without an error being thrown
  // in an earlier stage.
  // so it's safe to make it non nullable
  const user = extractUserInfo(req) as RequestUser;

  req.context = {
    requestId,
    user,
    req,
    logger: ServerLogger,
  };

  next();
}

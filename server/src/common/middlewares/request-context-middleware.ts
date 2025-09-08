import type { NextFunction, Request, Response } from "express";
import { ServerLogger } from "../logger-alternative";
import jwt from "jsonwebtoken";
import { ACCESS_JWTOKEN_SECRET } from "../../config";

export type RequestContext = {
  requestId: string;
  user: Request["user"] | null;
  req: Request;
  logger: typeof ServerLogger;
};

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}

function extractUserInfo(req: Request): null | Request["user"] {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  let userInfo: null | Request["user"] = null;
  jwt.verify(token, ACCESS_JWTOKEN_SECRET, (err, user) => {
    if (err) {
      userInfo = null;
    } else {
      userInfo = user as Request["user"];
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
  const user = extractUserInfo(req);

  req.context = {
    requestId,
    user,
    req,
    logger: ServerLogger,
  };

  next();
}

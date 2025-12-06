import {
  MethodNotAllowedErrorResponseDto,
  NotFoundErrorResponseDto,
} from "@snippetly/common/dto";
import type { Application, NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

type RouteWithMethods = {
  path: string;
  methods: Record<string, boolean>;
};

export function notFoundErrorMiddleware(
  req: Request,
  res: Response,
  _next: NextFunction,
  app: Application
) {
  // Get all registered routes, and filter only routes
  const routes = app.router.stack
    .filter((r) => r.route)
    .map((r) => r.route as unknown as RouteWithMethods)
    .filter((r) => r !== undefined);

  const match = routes.find((r) => r.path === req.path);

  if (match) {
    // Path exists but method not allowed
    const allowed = Object.keys(match.methods)
      .map((m) => m.toUpperCase())
      .join(", ");

    const rawRes = {
      type: "error",
      message: `Cannot ${req.method} ${req.originalUrl}`,
      status: StatusCodes.METHOD_NOT_ALLOWED,
      cause: {
        allowedMethods: allowed,
      },
    } satisfies z.infer<typeof MethodNotAllowedErrorResponseDto>;

    return res.status(rawRes.status).json(rawRes);
  }

  const rawRes = {
    type: "error",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    status: StatusCodes.NOT_FOUND,
    cause: null,
  } satisfies z.infer<typeof NotFoundErrorResponseDto>;

  return res.status(rawRes.status).json(rawRes);
}

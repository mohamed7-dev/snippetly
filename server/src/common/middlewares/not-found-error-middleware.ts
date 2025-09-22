import { Application, NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function notFoundErrorMiddleware(
  req: Request,
  res: Response,
  _next: NextFunction,
  app: Application
) {
  // Get all registered routes
  const routes = app.router.stack
    .filter((r: any) => r.route) // filter only routes
    .map((r: any) => r.route);

  // Check if path exists
  const match = routes.find((r: any) => r.path === req.path);

  if (match) {
    // Path exists but method not allowed
    const allowed = Object.keys(match.methods)
      .map((m) => m.toUpperCase())
      .join(", ");

    return res.status(405).json({
      error: StatusCodes.METHOD_NOT_ALLOWED,
      allowedMethods: allowed,
    });
  }
  return res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: `Cannot ${req.method} ${req.originalUrl}` });
}

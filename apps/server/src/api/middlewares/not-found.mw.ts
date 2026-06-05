import { RouteNotFoundError } from '@snippetly/common/errors';
import { NextFunction, Request, Response } from 'express';

export function notFound(req: Request, _res: Response, next: NextFunction) {
    next(new RouteNotFoundError({ path: req.originalUrl }));
}

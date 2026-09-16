import { NextFunction, Request, Response } from 'express';
import { RouteNotFoundError } from '../../common/errors/errors';

export function notFound(req: Request, _res: Response, next: NextFunction) {
    next(new RouteNotFoundError({ path: req.originalUrl }));
}

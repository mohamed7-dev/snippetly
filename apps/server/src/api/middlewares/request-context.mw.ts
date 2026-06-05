import { NextFunction, Request, Response } from 'express';
import { resolveRequestContext } from '../request-context/utils';

export function attachGetRequestContextUtility() {
    return (req: Request, _res: Response, next: NextFunction) => {
        req.getRequestContext = () => {
            const ctx = resolveRequestContext(req);

            if (!ctx) throw new Error('RequestContext missing');

            return ctx;
        };
        next();
    };
}

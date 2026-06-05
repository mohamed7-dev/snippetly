import { UserInputError } from '@snippetly/common/errors';
import { Request, RequestHandler } from 'express';
import { ZodError, ZodType } from 'zod';

export function mapZodError(error: ZodError): Record<string, string> {
    const fields: Record<string, string> = {};

    for (const issue of error.issues) {
        const key = issue.path.join('.');
        fields[key] = issue.message;
    }

    return fields;
}

export function inputValidationPipe(body?: ZodType, query?: ZodType, params?: ZodType): RequestHandler {
    return (req, _res, next) => {
        if (body) {
            const r = body.safeParse(req.body);
            if (!r.success)
                return next(new UserInputError('errors.user-input-error', undefined, mapZodError(r.error)));
            req.body = r.data as Request['body'];
        }

        if (query) {
            const r = query.safeParse(req.query);
            if (!r.success)
                return next(new UserInputError('errors.user-input-error', undefined, mapZodError(r.error)));
            req.query = r.data as Request['query'];
        }

        if (params) {
            const r = params.safeParse(req.params);
            if (!r.success)
                return next(new UserInputError('errors.user-input-error', undefined, mapZodError(r.error)));
            req.params = r.data as Request['params'];
        }

        next();
    };
}

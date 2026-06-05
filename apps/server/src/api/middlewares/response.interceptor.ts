import { RequestHandler } from 'express';
import { ZodType } from 'zod';

export function responseInterceptor(responseSchema?: ZodType): RequestHandler {
    if (!responseSchema) {
        return (_req, _res, next) => next();
    }

    return (_req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = (body: any) => {
            const parsed = responseSchema.safeParse(body);
            if (!parsed.success) {
                // This should NEVER reach client as validation error
                // because this is a developer bug.

                throw new Error(`Response validation failed:\n${parsed.error.message}`);
            }

            return originalJson(parsed.data);
        };

        next();
    };
}

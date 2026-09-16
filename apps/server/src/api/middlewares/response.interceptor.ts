import { RequestHandler } from 'express';
import z, { ZodType } from 'zod';
import { ApiError } from '../../common/errors/generated-developer-errors';
import { I18nService } from '../../infra/i18n/i18n.service';
import { iocContainer } from '../../infra/ioc-container/ioc-container';

export function responseInterceptor(responseSchema?: ZodType): RequestHandler {
    if (!responseSchema) {
        return (_req, _res, next) => next();
    }

    return (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = (body: any) => {
            if (body instanceof ApiError) {
                const i18nService = iocContainer.resolve<I18nService>(I18nService);
                const translated = i18nService.translateApiError(body, req);
                body = { ...body, message: translated.message };
            }
            let parsed = responseSchema.safeParse(body);
            if (!parsed.success) {
                const serverErrorSchema = z.object({
                    message: z.string().nonempty(),
                    code: z.string().nonempty(),
                    httpStatusCode: z.number().int(),
                });
                parsed = serverErrorSchema.safeParse(body);
                if (!parsed.success) {
                    // This should NEVER reach client as validation error
                    // because this is a developer bug.

                    throw new Error(`Response validation failed:\n${parsed.error.message}`);
                }
            }

            return originalJson(parsed.data);
        };

        next();
    };
}

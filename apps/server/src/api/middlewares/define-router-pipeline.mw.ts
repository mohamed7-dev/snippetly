import { RequestHandler } from 'express';
import { z, ZodType } from 'zod';
import { inputValidationPipe } from './input-validation.pipe';
import { responseInterceptor } from './response.interceptor';

export type Interceptor = (handler: RequestHandler) => RequestHandler;

type ValidateRouteOptions<
    TBody extends ZodType | undefined,
    TQuery extends ZodType | undefined,
    TParams extends ZodType | undefined,
    TResponse extends ZodType | undefined,
> = {
    before?: RequestHandler[];
    after?: RequestHandler[];

    body?: TBody;
    query?: TQuery;
    params?: TParams;
    response?: TResponse;

    interceptors?: Interceptor[];

    handler: RequestHandler<
        TParams extends ZodType ? z.infer<TParams> : any,
        any,
        TBody extends ZodType ? z.infer<TBody> : any,
        TQuery extends ZodType ? z.infer<TQuery> : any
    >;
};

export function defineRoutePipeline<
    TBody extends ZodType | undefined = undefined,
    TQuery extends ZodType | undefined = undefined,
    TParams extends ZodType | undefined = undefined,
    TResponse extends ZodType | undefined = undefined,
>(opts: ValidateRouteOptions<TBody, TQuery, TParams, TResponse>) {
    const inputMw = inputValidationPipe(opts.body, opts.query, opts.params);

    const outputMw = responseInterceptor(opts.response);

    let handler = opts.handler;

    for (const interceptor of opts.interceptors ?? []) {
        handler = interceptor(handler as any);
    }

    /*
    before middleware
    ↓
    input validation
    ↓
    output validation
    ↓
    after middleware
    ↓
    apply interceptors
    ↓
    typed handler and wrapped in a transaction
    */
    return [...(opts.before ?? []), inputMw, outputMw, handler, ...(opts.after ?? [])] as RequestHandler[];
}

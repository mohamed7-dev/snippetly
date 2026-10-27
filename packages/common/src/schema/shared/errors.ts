import z from 'zod';
import { internalServerErrorSchema, rateLimiterErrorSchema } from './generated-server-errors.js';

export {
    blockedByCorsErrorSchema,
    entityNotFoundErrorSchema,
    forbiddenErrorSchema,
    notFoundErrorSchema,
    routeNotFoundErrorSchema,
    unverifiedExternalEmailErrorSchema,
    userInputErrorSchema,
} from './generated-server-errors.js';

type WithServerErrorsOutput<TSuccess extends z.ZodType, TRouteErrors extends readonly z.ZodType[]> =
    | z.output<TSuccess>
    | z.output<typeof internalServerErrorSchema>
    | z.output<typeof rateLimiterErrorSchema>
    | z.output<TRouteErrors[number]>;

export function withServerErrors<
    TSuccess extends z.ZodType,
    const TRouteErrors extends readonly z.ZodType[] = [],
>(
    successSchema: TSuccess,
    routeErrors: TRouteErrors = [] as unknown as TRouteErrors,
): z.ZodType<WithServerErrorsOutput<TSuccess, TRouteErrors>> {
    const schema = z.union([
        successSchema,
        internalServerErrorSchema,
        rateLimiterErrorSchema,
        ...routeErrors,
    ] as const);

    return schema;
}

/**
 * @description
 * Represents an error that gets thrown when the native authentication strategy is not configured however attempting an operation that depends on it being configured.
 */
export const nativeAuthStrategyError = z.object({
    code: z.literal('NATIVE_AUTH_STRATEGY_ERROR'),
    httpStatusCode: z.literal(500),
    message: z.string().nonempty(),
});

export type NativeAuthStrategyError = z.infer<typeof nativeAuthStrategyError>;

/**
 * @description
 * Represents an error that gets thrown when the authentication credentials provided by the user are not valid.
 */
export const invalidCredentialsError = z.object({
    code: z.literal('INVALID_CREDENTIALS_ERROR'),
    httpStatusCode: z.literal(401),
    message: z.string().nonempty(),
    reason: z.string(),
});

export type InvalidCredentialsError = z.infer<typeof invalidCredentialsError>;

/**
 * @description
 * Represents an error that gets thrown when attempting to create a developer or admin account with an email address already registered to an existing user.
 */
export const emailAddressConflictError = z.object({
    code: z.literal('EMAIL_ADDRESS_CONFLICT_ERROR'),
    httpStatusCode: z.literal(409),
    message: z.string().nonempty(),
});

export type EmailAddressConflictError = z.infer<typeof emailAddressConflictError>;

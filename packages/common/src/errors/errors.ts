import { I18nError } from './i18n-error.js';
import { LogLevel, Schemable } from './types.js';

/**
 * @description
 * Represents an internal server error that occurs during request processing.
 * Used for unexpected server-side failures that are not related to user input.
 */
export class InternalServerError extends I18nError implements Schemable {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(message, variables, 500, 'INTERNAL_SERVER_ERROR', LogLevel.error);
    }

    public defineSchema() {
        return `z.object({
            code: z.literal('INTERNAL_SERVER_ERROR'),
            statusCode: z.literal(500),
            message: z.string(),
        });`;
    }
}

/**
 * @description
 * Represents an error caused by invalid user input.
 * Used when the user provides data that fails validation or business rules.
 */
export class UserInputError extends I18nError implements Schemable {
    constructor(
        message: string,
        variables: { [key: string]: string | number } = {},
        public fields?: Record<string, string>,
    ) {
        super(message, variables, 400, 'USER_INPUT_ERROR', LogLevel.warn);
    }

    public defineSchema() {
        return `z.object({
            code: z.literal('USER_INPUT_ERROR'),
            statusCode: z.literal(400),
            message: z.string(),
            fields: z.record(z.string(), z.string()).optional(),
        });`;
    }
}

/**
 * @description
 * Represents an error caused by a resource not being found.
 */
export class NotFoundError extends I18nError implements Schemable {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(message, variables, 404, 'NOT_FOUND_ERROR', LogLevel.warn);
    }

    public defineSchema() {
        return `z.object({
            code: z.literal('NOT_FOUND_ERROR'),
            statusCode: z.literal(404),
            message: z.string(),
        });`;
    }
}

/**
 * @description
 * Represents an error caused by a route not being found.
 */
export class RouteNotFoundError extends I18nError implements Schemable {
    constructor(variables: { path: string }) {
        super('errors.route-not-found', variables, 404, 'ROUTE_NOT_FOUND_ERROR', LogLevel.warn);
    }

    public defineSchema() {
        return `z.object({
            code: z.literal('ROUTE_NOT_FOUND_ERROR'),
            statusCode: z.literal(404),
            message: z.string(),
        });`;
    }
}

/**
 * @description
 * Represents an error caused by a user not having permission to access a resource.
 */
export class ForbiddenError extends I18nError implements Schemable {
    constructor() {
        super('errors.forbidden', {}, 403, 'FORBIDDEN_ERROR', LogLevel.warn);
    }

    public defineSchema() {
        return `z.object({
            code: z.literal('FORBIDDEN_ERROR'),
            statusCode: z.literal(403),
            message: z.string(),
        });`;
    }
}

/**
 * @description
 * Represents an error caused by a request being blocked by CORS.
 */
export class BlockedByCorsError extends I18nError implements Schemable {
    constructor() {
        super('errors.blocked-by-cors', {}, 403, 'BLOCKED_BY_CORS_ERROR', LogLevel.warn);
    }

    public defineSchema() {
        return `z.object({
            code: z.literal('BLOCKED_BY_CORS_ERROR'),
            statusCode: z.literal(403),
            message: z.string(),
        });`;
    }
}

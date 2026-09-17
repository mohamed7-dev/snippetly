import { LogLevel } from '../../config/system/logger/logger-strategy.interface';
import { EntityNames } from '../../entities/entities-map';
import { I18nError } from '../../infra/i18n/i18n-error';

/**
 * @description
 * Represents an internal server error that occurs during request processing.
 * Used for unexpected server-side failures that are not related to user input.
 */
export class InternalServerError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(message, variables, 500, 'INTERNAL_SERVER_ERROR', LogLevel.error);
    }
}

/**
 * @description
 * Represents an error caused by invalid user input.
 * Used when the user provides data that fails validation or business rules.
 */
export class UserInputError extends I18nError {
    constructor(
        message: string,
        variables: { [key: string]: string | number } = {},
        public fields?: Record<string, string>,
    ) {
        super(message, variables, 400, 'USER_INPUT_ERROR', LogLevel.warn);
    }
}

/**
 * @description
 * Represents an error caused by an entity not being found in the database.
 */
export class EntityNotFoundError extends I18nError {
    constructor(
        variables: {
            entityName: EntityNames;
            entityId: string;
        },
        logLevel?: LogLevel,
    ) {
        super(
            'errors.entity_with_id_not_found',
            variables,
            404,
            'ENTITY_NOT_FOUND_ERROR',
            logLevel ?? LogLevel.warn,
        );
    }
}

/**
 * @description
 * Represents an error caused by a resource not being found.
 */
export class NotFoundError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(message, variables, 404, 'NOT_FOUND_ERROR', LogLevel.warn);
    }
}

/**
 * @description
 * Represents an error caused by a route not being found.
 */
export class RouteNotFoundError extends I18nError {
    constructor(variables: { path: string }) {
        super('errors.route-not-found', variables, 404, 'ROUTE_NOT_FOUND_ERROR', LogLevel.warn);
    }
}

/**
 * @description
 * Represents an error caused by a user not having permission to access a resource.
 */
export class ForbiddenError extends I18nError {
    constructor() {
        super('errors.forbidden', {}, 403, 'FORBIDDEN_ERROR', LogLevel.warn);
    }
}

/**
 * @description
 * Represents an error caused by a request being blocked by CORS.
 */
export class BlockedByCorsError extends I18nError {
    constructor() {
        super('errors.blocked-by-cors', {}, 403, 'BLOCKED_BY_CORS_ERROR', LogLevel.warn);
    }
}

/**
 * @description
 * Represents a request that was rejected by the rate limiter.
 * Used when a client exceeds the allowed request quota.
 */
export class RateLimiterError extends I18nError {
    constructor(
        message = 'errors.rate-limiter-exceeded',
        variables: { [key: string]: string | number } = {},
    ) {
        super(message, variables, 429, 'RATE_LIMITER_ERROR', LogLevel.warn);
    }
}

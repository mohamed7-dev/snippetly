import { ApiError } from './api-error.js';
import { Schemable } from './types.js';

export class InvalidCredentialsError extends ApiError implements Schemable {
    readonly code = 'INVALID_CREDENTIALS_ERROR';
    readonly message = 'INVALID_CREDENTIALS_ERROR';
    readonly statusCode = 401; // server failed to establish identity due to invalid credentials
    readonly reason: string;
    constructor(input: { reason: string }) {
        super();
        this.reason = input.reason;
    }

    defineSchema() {
        return `z.object({
            code: z.literal('INVALID_CREDENTIALS_ERROR'),
            statusCode: z.literal(401),
            message: z.string(),
            reason: z.string(),
        });`;
    }
}

export class NotVerifiedAccountError extends ApiError implements Schemable {
    readonly code = 'NOT_VERIFIED_ACCOUNT_ERROR' as any;
    readonly message = 'NOT_VERIFIED_ACCOUNT_ERROR';
    readonly statusCode = 403; // server understood req, but refused to authorize it
    constructor() {
        super();
    }

    defineSchema() {
        return `z.object({
            code: z.literal('NOT_VERIFIED_ACCOUNT_ERROR'),
            statusCode: z.literal(403),
            message: z.string(),
        });`;
    }
}

export class NativeAuthStrategyError extends ApiError implements Schemable {
    readonly code = 'NATIVE_AUTH_STRATEGY_ERROR' as any;
    readonly message = 'NATIVE_AUTH_STRATEGY_ERROR';
    readonly statusCode = 500;
    constructor() {
        super();
    }

    defineSchema() {
        return `z.object({
            code: z.literal('NATIVE_AUTH_STRATEGY_ERROR'),
            statusCode: z.literal(500),
            message: z.string(),
        });`;
    }
}

export class EmailAddressConflictError extends ApiError implements Schemable {
    readonly code = 'EMAIL_ADDRESS_CONFLICT_ERROR' as any;
    readonly message = 'EMAIL_ADDRESS_CONFLICT_ERROR';
    readonly statusCode = 409;
    constructor() {
        super();
    }

    defineSchema() {
        return `z.object({
            code: z.literal('EMAIL_ADDRESS_CONFLICT_ERROR'),
            statusCode: z.literal(409),
            message: z.string(),
        });`;
    }
}

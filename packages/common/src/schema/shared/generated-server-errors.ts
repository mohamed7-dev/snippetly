/* eslint-disable */
/**
 * ---------------------------------------------------------
 * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
 * ---------------------------------------------------------
 */
import { z } from 'zod';

export const blockedByCorsErrorSchema = z.object({
    httpStatusCode: z.literal(403),
    code: z.literal("BLOCKED_BY_CORS_ERROR"),
    message: z.string(),
});

export const entityNotFoundErrorSchema = z.object({
    httpStatusCode: z.literal(404),
    code: z.literal("ENTITY_NOT_FOUND_ERROR"),
    message: z.string(),
});

export const forbiddenErrorSchema = z.object({
    httpStatusCode: z.literal(403),
    code: z.literal("FORBIDDEN_ERROR"),
    message: z.string(),
});

export const internalServerErrorSchema = z.object({
    httpStatusCode: z.literal(500),
    code: z.literal("INTERNAL_SERVER_ERROR"),
    message: z.string(),
});

export const notFoundErrorSchema = z.object({
    httpStatusCode: z.literal(404),
    code: z.literal("NOT_FOUND_ERROR"),
    message: z.string(),
});

export const rateLimiterErrorSchema = z.object({
    httpStatusCode: z.literal(429),
    code: z.literal("RATE_LIMITER_ERROR"),
    message: z.string(),
});

export const routeNotFoundErrorSchema = z.object({
    httpStatusCode: z.literal(404),
    code: z.literal("ROUTE_NOT_FOUND_ERROR"),
    message: z.string(),
});

export const unverifiedExternalEmailErrorSchema = z.object({
    httpStatusCode: z.literal(409),
    code: z.literal("UNVERIFIED_EXTERNAL_EMAIL_ERROR"),
    message: z.string(),
});

export const userInputErrorSchema = z.object({
    httpStatusCode: z.literal(400),
    code: z.literal("USER_INPUT_ERROR"),
    fields: z.record(z.string(), z.string()).optional(),
    message: z.string(),
});

export const serverErrorSchema = z.discriminatedUnion('code', [
    blockedByCorsErrorSchema,
    entityNotFoundErrorSchema,
    forbiddenErrorSchema,
    internalServerErrorSchema,
    notFoundErrorSchema,
    rateLimiterErrorSchema,
    routeNotFoundErrorSchema,
    unverifiedExternalEmailErrorSchema,
    userInputErrorSchema,
]);

export type ServerErrorDto = z.infer<typeof serverErrorSchema>;

/* eslint-disable */
// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
import { z } from "zod";


export const blockedByCorsErrorDto = z.object({
            code: z.literal('BLOCKED_BY_CORS_ERROR'),
            statusCode: z.literal(403),
            message: z.string(),
        });;

export type BlockedByCorsErrorDto = z.infer<typeof blockedByCorsErrorDto>;


export const forbiddenErrorDto = z.object({
            code: z.literal('FORBIDDEN_ERROR'),
            statusCode: z.literal(403),
            message: z.string(),
        });;

export type ForbiddenErrorDto = z.infer<typeof forbiddenErrorDto>;


export const internalServerErrorDto = z.object({
            code: z.literal('INTERNAL_SERVER_ERROR'),
            statusCode: z.literal(500),
            message: z.string(),
        });;

export type InternalServerErrorDto = z.infer<typeof internalServerErrorDto>;


export const notFoundErrorDto = z.object({
            code: z.literal('NOT_FOUND_ERROR'),
            statusCode: z.literal(404),
            message: z.string(),
        });;

export type NotFoundErrorDto = z.infer<typeof notFoundErrorDto>;


export const routeNotFoundErrorDto = z.object({
            code: z.literal('ROUTE_NOT_FOUND_ERROR'),
            statusCode: z.literal(404),
            message: z.string(),
        });;

export type RouteNotFoundErrorDto = z.infer<typeof routeNotFoundErrorDto>;


export const userInputErrorDto = z.object({
            code: z.literal('USER_INPUT_ERROR'),
            statusCode: z.literal(400),
            message: z.string(),
            fields: z.record(z.string(), z.string()).optional(),
        });;

export type UserInputErrorDto = z.infer<typeof userInputErrorDto>;


export const emailAddressConflictErrorDto = z.object({
            code: z.literal('EMAIL_ADDRESS_CONFLICT_ERROR'),
            statusCode: z.literal(409),
            message: z.string(),
        });;

export type EmailAddressConflictErrorDto = z.infer<typeof emailAddressConflictErrorDto>;


export const invalidCredentialsErrorDto = z.object({
            code: z.literal('INVALID_CREDENTIALS_ERROR'),
            statusCode: z.literal(401),
            message: z.string(),
            reason: z.string(),
        });;

export type InvalidCredentialsErrorDto = z.infer<typeof invalidCredentialsErrorDto>;


export const nativeAuthStrategyErrorDto = z.object({
            code: z.literal('NATIVE_AUTH_STRATEGY_ERROR'),
            statusCode: z.literal(500),
            message: z.string(),
        });;

export type NativeAuthStrategyErrorDto = z.infer<typeof nativeAuthStrategyErrorDto>;


export const notVerifiedAccountErrorDto = z.object({
            code: z.literal('NOT_VERIFIED_ACCOUNT_ERROR'),
            statusCode: z.literal(403),
            message: z.string(),
        });;

export type NotVerifiedAccountErrorDto = z.infer<typeof notVerifiedAccountErrorDto>;


export const missingPasswordErrorDto = z.object({
            code: z.literal('MISSING_PASSWORD_ERROR'),
            statusCode: z.literal(400),
            message: z.string(),
        });;

export type MissingPasswordErrorDto = z.infer<typeof missingPasswordErrorDto>;


export const passwordValidationErrorDto = z.object({
            code: z.literal('PASSWORD_VALIDATION_ERROR'),
            statusCode: z.literal(400),
            message: z.string(),
            validationErrorMessage:z.string()
        });;

export type PasswordValidationErrorDto = z.infer<typeof passwordValidationErrorDto>;

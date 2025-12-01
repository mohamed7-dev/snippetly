import * as z from "zod";
export { z };
export declare const baseModelSchema: z.ZodObject<{
    id: z.ZodNumber;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export declare const STRONG_PASSWORD_SCHEMA: z.ZodString;
export declare const LIMIT_SCHEMA: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
export declare function createSuccessResponse<T extends z.ZodTypeAny>(dataSchema: T, id: string, description: string, dataExample: unknown, message?: string, status?: number): z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: T;
}, z.core.$strip>;
export declare function createConflictResponse<T extends z.ZodTypeAny>(dataSchema: T, id: string, description: string, dataExample: unknown, message?: string): z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"conflict">;
    data: T;
}, z.core.$strip>;
export declare function createErrorResponse(): z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const GlobalErrorResponseDto: z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const InternalServerErrorResponseDto: z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const UnauthorizedErrorResponseDto: z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const ForbiddenErrorResponseDto: z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const BadRequestErrorResponseDto: z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;

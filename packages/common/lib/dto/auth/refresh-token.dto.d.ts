import { z } from "../zod";
export declare const RefreshTokenSuccessResponseDto: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodObject<{
        user: z.ZodObject<{
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
            name: z.ZodString;
            firstName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            lastName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            email: z.ZodEmail;
            image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            imageCustomId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            imageKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            isPrivate: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>;
        accessToken: z.ZodJWT;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RefreshTokenSuccessResponseDtoType = z.infer<typeof RefreshTokenSuccessResponseDto>;
export declare const RefreshTokenResponseDto: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodObject<{
        user: z.ZodObject<{
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
            name: z.ZodString;
            firstName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            lastName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            email: z.ZodEmail;
            image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            imageCustomId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            imageKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            isPrivate: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>;
        accessToken: z.ZodJWT;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>], "type">;
export type RefreshTokenResponseDtoType = z.infer<typeof RefreshTokenResponseDto>;

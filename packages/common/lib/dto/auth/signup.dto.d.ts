import { z } from "../zod";
export declare const SignupRequestDto: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
    acceptedPolicies: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type SignupRequestDtoType = z.infer<typeof SignupRequestDto>;
export declare const SignupConflictResponseDto: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"conflict">;
    data: z.ZodObject<{
        suggestedNames: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type SignupConflictResponseDtoType = z.infer<typeof SignupConflictResponseDto>;
export declare const SignupSuccessResponseDto: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodObject<{
        user: z.ZodObject<{
            createdAt: z.ZodDate;
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
export type SignupSuccessResponseDtoType = z.infer<typeof SignupSuccessResponseDto>;
export declare const SignupResponseDto: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodObject<{
        user: z.ZodObject<{
            createdAt: z.ZodDate;
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
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"conflict">;
    data: z.ZodObject<{
        suggestedNames: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>], "type">;
export type SignupResponseDtoType = z.infer<typeof SignupResponseDto>;

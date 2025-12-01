import z from "zod";
export declare const LoginRequestDto: z.ZodObject<{
    name: z.ZodString;
    password: z.ZodString;
    rememberMe: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type LoginRequestDtoType = z.infer<typeof LoginRequestDto>;
export declare const LoginSuccessResponseDto: z.ZodObject<{
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
export type LoginSuccessResponseDtoType = z.infer<typeof LoginSuccessResponseDto>;
export declare const LoginResponseDto: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type LoginResponseDtoType = z.infer<typeof LoginResponseDto>;

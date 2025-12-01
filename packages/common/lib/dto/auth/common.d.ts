import { z } from "../zod";
export declare const CommonAuthResponseDto: z.ZodObject<{
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
export declare const CommonAuthResponseDtoExample: {
    user: {
        name: string;
        firstName: string;
        lastName: string;
        image: string;
        imageKey: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        isPrivate: false;
    };
    accessToken: string;
};
export declare const SendTokenViaEmailDto: z.ZodObject<{
    email: z.ZodEmail;
}, z.core.$strip>;
export declare const VerifyTokenRequestDto: z.ZodObject<{
    token: z.ZodUUID;
}, z.core.$strip>;
export declare const protectedRouteCookiesSchema: z.ZodObject<{
    "refresh-token": z.ZodString;
}, z.core.$strip>;
export declare const protectedRouteHeadersSchema: z.ZodObject<{
    authorization: z.ZodString;
}, z.core.$strip>;

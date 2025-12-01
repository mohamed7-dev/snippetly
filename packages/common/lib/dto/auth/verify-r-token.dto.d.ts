import { z } from "../zod";
export declare const VerifyRTokenRequestQueryDto: z.ZodObject<{
    token: z.ZodUUID;
}, z.core.$strip>;
export type VerifyRTokenRequestQueryDtoType = z.infer<typeof VerifyRTokenRequestQueryDto>;
export declare const VerifyRTokenRequestBodyDto: z.ZodObject<{
    password: z.ZodString;
}, z.core.$strip>;
export type VerifyRTokenRequestBodyDtoType = z.infer<typeof VerifyRTokenRequestBodyDto>;
export declare const VerifyRTokenSuccessResponseDto: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodNull;
}, z.core.$strip>;
export declare const VerifyRTokenResponseDto: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodNull;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>], "type">;
export type VerifyRTokenResponseDtoType = z.infer<typeof VerifyRTokenResponseDto>;

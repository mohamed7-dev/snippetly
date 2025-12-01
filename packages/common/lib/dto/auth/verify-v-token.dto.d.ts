import { z } from "../zod";
export declare const VerifyVTokenRequestDto: z.ZodObject<{
    token: z.ZodUUID;
}, z.core.$strip>;
export type VerifyVTokenRequestDtoType = z.infer<typeof VerifyVTokenRequestDto>;
export declare const VerifyVTokenSuccessResponseDto: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodNull;
}, z.core.$strip>;
export declare const VerifyVTokenResponseDto: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type VerifyVTokenResponseDtoType = z.infer<typeof VerifyVTokenResponseDto>;

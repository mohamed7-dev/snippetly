import { z } from "../zod";
export declare const SendRTokenRequestDto: z.ZodObject<{
    email: z.ZodEmail;
}, z.core.$strip>;
export type SendRTokenRequestDtoType = z.infer<typeof SendRTokenRequestDto>;
export declare const SendRTokenSuccessResponseDto: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodNull;
}, z.core.$strip>;
export declare const SendRTokenResponseDto: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type SendRTokenResponseDtoType = z.infer<typeof SendRTokenResponseDto>;

import { z } from "../zod";
export declare const SendVEmailRequestDto: z.ZodObject<{
    email: z.ZodEmail;
}, z.core.$strip>;
export type SendVEmailRequestDtoType = z.infer<typeof SendVEmailRequestDto>;
export declare const SendVEmailSuccessResponseDto: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodNull;
}, z.core.$strip>;
export type SendVEmailSuccessResponseDtoType = z.infer<typeof SendVEmailSuccessResponseDto>;
export declare const SendVEmailResponseDto: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type SendVEmailResponseDtoType = z.infer<typeof SendVEmailResponseDto>;

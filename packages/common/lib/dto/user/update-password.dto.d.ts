import { z } from "../zod";
export declare const UpdateUserPasswordDto: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    email: z.ZodEmail;
}, z.core.$strip>;
export type UpdateUserPasswordDtoType = z.infer<typeof UpdateUserPasswordDto>;
export declare const ForgetPasswordDto: z.ZodObject<{
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodString;
    email: z.ZodEmail;
}, z.core.$strip>;
export type ForgetPasswordDtoType = z.infer<typeof ForgetPasswordDto>;

import { z } from "../zod";
export declare const CreateUserDto: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
    acceptedPolicies: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateUserDtoType = z.infer<typeof CreateUserDto>;

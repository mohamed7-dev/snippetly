import { z } from "../zod";
export declare const UpdateUserRequestDto: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    lastName: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    email: z.ZodOptional<z.ZodEmail>;
    bio: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    image: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    imageCustomId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    imageKey: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    isPrivate: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateUserRequestDtoType = z.infer<typeof UpdateUserRequestDto>;
export declare const UpdateUserSuccessResponseDto: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodObject<{
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        name: z.ZodString;
        firstName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        lastName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        email: z.ZodEmail;
        bio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        isPrivate: z.ZodDefault<z.ZodBoolean>;
        emailVerifiedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateUserResponseDto: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    type: z.ZodLiteral<"success">;
    data: z.ZodObject<{
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        name: z.ZodString;
        firstName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        lastName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        email: z.ZodEmail;
        bio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        isPrivate: z.ZodDefault<z.ZodBoolean>;
        emailVerifiedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    status: z.ZodNumber;
    message: z.ZodString;
    cause: z.ZodNullable<z.ZodString>;
}, z.core.$strip>], "type">;
export type UpdateUserResponseDtoType = z.infer<typeof UpdateUserResponseDto>;

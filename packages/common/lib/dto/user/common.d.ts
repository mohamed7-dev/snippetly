import { z } from "../zod";
export declare const CommonUserResDto: z.ZodObject<{
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
export declare const CommonUserResDtoExample: {
    name: string;
    firstName: string;
    lastName: string;
    image: string;
    imageKey: string;
    bio: string;
    email: string;
    emailVerifiedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    isPrivate: false;
};
export declare const UserActivityStatsDto: z.ZodObject<{
    snippetsCount: z.ZodNumber;
    collectionsCount: z.ZodNumber;
    forkedSnippetsCount: z.ZodNumber;
    forkedCollectionsCount: z.ZodNumber;
    friendsCount: z.ZodNumber;
    friendsInboxCount: z.ZodNumber;
    friendsOutboxCount: z.ZodNumber;
}, z.core.$strip>;

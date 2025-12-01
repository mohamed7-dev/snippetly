import { z } from "../zod";
export declare const GetCurrentUserFriendsDto: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
    }, z.core.$strip>>;
    query: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GetCurrentUserFriendsDtoType = z.infer<typeof GetCurrentUserFriendsDto>;

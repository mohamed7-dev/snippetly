import { z } from "../zod";
export declare const ManageFriendshipDto: z.ZodObject<{
    friend_name: z.ZodString;
}, z.core.$strip>;
export type ManageFriendshipDtoType = z.infer<typeof ManageFriendshipDto>;

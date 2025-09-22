import z from "zod";
import { baseModelSchema } from "../../../common/lib/zod.js";
// Get User's Inbox/Outbox/Friends
export const GetCurrentUserFriendsDto = z.object({
    limit: z.number().min(1).max(100).optional(),
    cursor: baseModelSchema.pick({
        id: true
    }).optional(),
    query: z.string().nonempty().optional()
});

import { createSelectSchema } from "drizzle-zod";
import { friendshipsTable } from "../../../common/db/schema";
import z from "zod";

export const SelectFriendshipDto = createSelectSchema(friendshipsTable);

export type SelectFriendshipDtoType = z.infer<typeof SelectFriendshipDto>;

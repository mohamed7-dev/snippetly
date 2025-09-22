import { createSelectSchema } from "drizzle-zod";
import { friendshipsTable } from "../../../common/db/schema.js";
export const SelectFriendshipDto = createSelectSchema(friendshipsTable);

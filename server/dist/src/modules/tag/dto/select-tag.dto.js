import { createSelectSchema } from "drizzle-zod";
import { tagsTable } from "../../../common/db/schema.js";
export const SelectTagDto = createSelectSchema(tagsTable);

import z from "zod";
import { createSelectSchema } from "drizzle-zod";
import { tagsTable } from "../../../common/db/schema.ts";

export const SelectTagDto = createSelectSchema(tagsTable);

export type SelectTagDtoType = z.infer<typeof SelectTagDto>;

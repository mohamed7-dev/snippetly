import z from "zod";
import { createSelectSchema } from "drizzle-zod";
import { collectionsTable } from "../../../common/db/schema";

export const SelectCollectionDto = createSelectSchema(collectionsTable);

export type SelectCollectionDtoType = z.infer<typeof SelectCollectionDto>;

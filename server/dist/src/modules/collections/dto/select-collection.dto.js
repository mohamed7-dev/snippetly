import { createSelectSchema } from "drizzle-zod";
import { collectionsTable } from "../../../common/db/schema.js";
export const SelectCollectionDto = createSelectSchema(collectionsTable);

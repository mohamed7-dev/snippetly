import { createSelectSchema } from "drizzle-zod";
import { snippetsTable } from "../../../common/db/schema.js";
export const SelectSnippetDto = createSelectSchema(snippetsTable);

import z from "zod";
import { createSelectSchema } from "drizzle-zod";
import { snippetsTable } from "../../../common/db/schema";

export const SelectSnippetDto = createSelectSchema(snippetsTable);

export type SelectSnippetDtoType = z.infer<typeof SelectSnippetDto>;

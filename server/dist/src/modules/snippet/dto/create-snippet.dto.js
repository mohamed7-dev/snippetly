import z from "zod";
import { SelectTagDto } from "../../tag/dto/select-tag.dto.js";
import { SelectCollectionDto } from "../../collections/dto/select-collection.dto.js";
import { createInsertSchema } from "drizzle-zod";
import { snippetsTable } from "../../../common/db/schema.js";
export const CreateSnippetDto = createInsertSchema(snippetsTable).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    creatorId: true,
    collectionId: true,
    forkedFrom: true,
    slug: true,
    note: true
}).extend({
    tags: z.array(SelectTagDto.shape.name).optional(),
    collection: SelectCollectionDto.shape.slug
});

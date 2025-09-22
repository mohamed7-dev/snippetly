import z from "zod";
import { CreateSnippetDto } from "./create-snippet.dto.ts";
import { SelectSnippetDto } from "./select-snippet.dto.ts";
import { createUpdateSchema } from "drizzle-zod";
import { snippetsTable } from "../../../common/db/schema.ts";
import { SelectCollectionDto } from "../../collections/dto/select-collection.dto.ts";

const updateSchema = createUpdateSchema(snippetsTable);

export const UpdateSnippetDto = z.object({
  slug: SelectSnippetDto.shape.slug,
  data: updateSchema
    .omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      creatorId: true,
      collectionId: true,
      forkedFrom: true,
      slug: true,
    })
    .extend({
      addTags: CreateSnippetDto.shape.tags,
      removeTags: CreateSnippetDto.shape.tags,
      collection: SelectCollectionDto.shape.slug,
    })
    .partial(),
});

export type UpdateSnippetDtoType = z.infer<typeof UpdateSnippetDto>;

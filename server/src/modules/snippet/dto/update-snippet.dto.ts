import z from "zod";
import { CreateSnippetDto } from "./create-snippet.dto";
import { SelectSnippetDto } from "./select-snippet.dto";
import { createUpdateSchema } from "drizzle-zod";
import { snippetsTable } from "../../../common/db/schema";
import { SelectCollectionDto } from "../../collections/dto/select-collection.dto";

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
    }),
});

export type UpdateSnippetDtoType = z.infer<typeof UpdateSnippetDto>;

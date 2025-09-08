import z from "zod";
import { CreateSnippetDto } from "./create-snippet.dto";
import { SelectSnippetDto } from "./select-snippet.dto";

export const UpdateSnippetDto = z.object({
  slug: SelectSnippetDto.shape.slug,
  data: CreateSnippetDto.omit({ tags: true })
    .extend({
      addTags: CreateSnippetDto.shape.tags,
      removeTags: CreateSnippetDto.shape.tags,
    })
    .partial(),
});

export type UpdateSnippetDtoType = z.infer<typeof UpdateSnippetDto>;

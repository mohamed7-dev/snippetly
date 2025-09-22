import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto.ts";
import { SelectCollectionDto } from "../../collections/dto/select-collection.dto.ts";

export const ForkSnippetDto = SelectSnippetDto.pick({
  slug: true,
}).extend({
  collection: SelectCollectionDto.shape.slug,
});
export type ForkSnippetDtoType = z.infer<typeof ForkSnippetDto>;

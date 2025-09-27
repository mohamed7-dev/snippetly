import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto";
import { SelectCollectionDto } from "../../collections/dto/select-collection.dto";

export const ForkSnippetDto = SelectSnippetDto.pick({
  slug: true,
}).extend({
  collection: SelectCollectionDto.shape.slug,
});
export type ForkSnippetDtoType = z.infer<typeof ForkSnippetDto>;

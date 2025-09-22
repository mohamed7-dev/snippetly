import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto.ts";
import { CreateCollectionDto } from "./create-collection.dto.ts";

export const UpdateCollectionDto = z.object({
  slug: SelectCollectionDto.shape.slug,
  data: CreateCollectionDto.omit({ tags: true })
    .extend({
      removeTags: CreateCollectionDto.shape.tags,
      addTags: CreateCollectionDto.shape.tags,
    })
    .partial(),
});
export type UpdateCollectionDtoType = z.infer<typeof UpdateCollectionDto>;

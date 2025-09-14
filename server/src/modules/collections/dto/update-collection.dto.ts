import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto";
import { CreateCollectionDto } from "./create-collection.dto";

export const UpdateFolderDto = z.object({
  slug: SelectCollectionDto.shape.slug,
  data: CreateCollectionDto.omit({ tags: true })
    .extend({
      removeTags: CreateCollectionDto.shape.tags,
      addTags: CreateCollectionDto.shape.tags,
    })
    .partial(),
});
export type UpdateFolderDtoType = z.infer<typeof UpdateFolderDto>;

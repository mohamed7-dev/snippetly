import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto.js";
import { CreateCollectionDto } from "./create-collection.dto.js";
export const UpdateCollectionDto = z.object({
    slug: SelectCollectionDto.shape.slug,
    data: CreateCollectionDto.omit({
        tags: true
    }).extend({
        removeTags: CreateCollectionDto.shape.tags,
        addTags: CreateCollectionDto.shape.tags
    }).partial()
});

import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto.js";
export const DeleteCollectionDto = z.object({
    slug: SelectCollectionDto.shape.slug
});

import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto.js";
export const ForkCollectionDto = z.object({
    slug: SelectCollectionDto.shape.slug
});

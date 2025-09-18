import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto";

export const DeleteCollectionDto = z.object({
  slug: SelectCollectionDto.shape.slug,
});

export type DeleteCollectionDtoType = z.infer<typeof DeleteCollectionDto>;

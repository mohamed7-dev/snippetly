import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto.ts";

export const ForkCollectionDto = z.object({
  slug: SelectCollectionDto.shape.slug,
});
export type ForkCollectionDtoType = z.infer<typeof ForkCollectionDto>;

import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto";

export const UpdateCollectionDto = z.object({
  code: SelectCollectionDto.shape.code,
  data: z.object({
    title: SelectCollectionDto.shape.title.nonoptional(),
  }),
});
export type UpdateCollectionDtoType = z.infer<typeof UpdateCollectionDto>;

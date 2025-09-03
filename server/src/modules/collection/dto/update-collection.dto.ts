import z from "zod";
import { CreateCollectionDto } from "./create-collection.dto";

export const UpdateCollectionDto = z.object({
  code: z.string().nonempty(),
  data: CreateCollectionDto.pick({ title: true }).extend({
    title: CreateCollectionDto.shape.title.nonoptional(),
  }),
});
export type UpdateCollectionDtoType = z.infer<typeof UpdateCollectionDto>;

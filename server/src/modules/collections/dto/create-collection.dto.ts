import z from "zod";
import { SelectTagDto } from "../../tag/dto/select-tag.dto.ts";
import { SelectCollectionDto } from "./select-collection.dto.ts";

export const CreateCollectionDto = SelectCollectionDto.pick({
  title: true,
  description: true,
  allowForking: true,
  isPrivate: true,
  color: true,
}).extend({
  tags: z.array(SelectTagDto.shape.name).optional(),
});

export type CreateCollectionDtoType = z.infer<typeof CreateCollectionDto>;

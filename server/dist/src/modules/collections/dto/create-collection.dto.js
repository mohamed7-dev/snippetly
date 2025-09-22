import z from "zod";
import { SelectTagDto } from "../../tag/dto/select-tag.dto.js";
import { SelectCollectionDto } from "./select-collection.dto.js";
export const CreateCollectionDto = SelectCollectionDto.pick({
    title: true,
    description: true,
    allowForking: true,
    isPrivate: true,
    color: true
}).extend({
    tags: z.array(SelectTagDto.shape.name).optional()
});

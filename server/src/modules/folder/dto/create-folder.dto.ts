import z from "zod";
import { SelectFolderDto } from "./select-folder.dto";
import { SelectTagDto } from "../../tag/dto/select-tag.dto";

export const CreateFolderDto = SelectFolderDto.pick({
  title: true,
  description: true,
  allowForking: true,
  isPrivate: true,
  color: true,
  tags: true,
}).extend({
  tags: z.array(SelectTagDto.shape.name).optional(),
});

export type CreateFolderDtoType = z.infer<typeof CreateFolderDto>;

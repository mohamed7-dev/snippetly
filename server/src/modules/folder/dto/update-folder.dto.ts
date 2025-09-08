import z from "zod";
import { SelectFolderDto } from "./select-folder.dto";
import { CreateFolderDto } from "./create-folder.dto";

export const UpdateFolderDto = z.object({
  code: SelectFolderDto.shape.code,
  data: CreateFolderDto.omit({ tags: true })
    .extend({
      removeTags: CreateFolderDto.shape.tags,
      addTags: CreateFolderDto.shape.tags,
    })
    .partial(),
});
export type UpdateFolderDtoType = z.infer<typeof UpdateFolderDto>;

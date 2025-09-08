import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto";
import { SelectTagDto } from "../../tag/dto/select-tag.dto";
import { SelectFolderDto } from "../../folder/dto/select-folder.dto";

export const CreateSnippetDto = SelectSnippetDto.pick({
  title: true,
  description: true,
  parseFormat: true,
  isPrivate: true,
  allowForking: true,
  folder: true,
  tags: true,
  code: true,
}).extend({
  tags: z.array(SelectTagDto.shape.name).optional(),
  isPrivate: SelectSnippetDto.shape.isPrivate.optional(),
  allowForking: SelectSnippetDto.shape.allowForking.optional(),
  folder: SelectFolderDto.shape.code,
});
export type CreateSnippetDtoType = z.infer<typeof CreateSnippetDto>;

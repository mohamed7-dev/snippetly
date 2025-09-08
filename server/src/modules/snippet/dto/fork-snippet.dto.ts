import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto";
import { SelectFolderDto } from "../../folder/dto/select-folder.dto";

export const ForkSnippetDto = SelectSnippetDto.pick({
  slug: true,
}).extend({
  folder: SelectFolderDto.shape.code,
});
export type ForkSnippetDtoType = z.infer<typeof ForkSnippetDto>;

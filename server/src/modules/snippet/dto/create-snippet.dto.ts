import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto";

export const CreateSnippetDto = SelectSnippetDto.pick({
  title: true,
  description: true,
  code: true,
  parseFormat: true,
  isPrivate: true,
  collection: true,
});
export type CreateSnippetDtoType = z.infer<typeof CreateSnippetDto>;

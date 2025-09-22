import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto.ts";

export const GetSnippetDto = z.object({
  slug: SelectSnippetDto.shape.slug,
});
export type GetSnippetDtoType = z.infer<typeof GetSnippetDto>;

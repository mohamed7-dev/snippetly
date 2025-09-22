import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto.ts";

export const DeleteSnippetDto = z.object({
  slug: SelectSnippetDto.shape.slug,
});

export type DeleteSnippetDtoType = z.infer<typeof DeleteSnippetDto>;

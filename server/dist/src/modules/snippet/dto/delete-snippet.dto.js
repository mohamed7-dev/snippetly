import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto.js";
export const DeleteSnippetDto = z.object({
    slug: SelectSnippetDto.shape.slug
});

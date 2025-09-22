import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto.js";
export const GetSnippetDto = z.object({
    slug: SelectSnippetDto.shape.slug
});

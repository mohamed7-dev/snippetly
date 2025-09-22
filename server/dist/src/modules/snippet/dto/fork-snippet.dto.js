import { SelectSnippetDto } from "./select-snippet.dto.js";
import { SelectCollectionDto } from "../../collections/dto/select-collection.dto.js";
export const ForkSnippetDto = SelectSnippetDto.pick({
    slug: true
}).extend({
    collection: SelectCollectionDto.shape.slug
});

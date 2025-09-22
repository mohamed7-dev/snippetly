import z from "zod";
import { SelectCollectionDto } from "../../collections/dto/select-collection.dto.js";
export const GetCollectionSnippetsDto = z.object({
    limit: z.number().min(1).max(100).optional(),
    cursor: z.string().transform((val)=>{
        try {
            return {
                updatedAt: new Date(JSON.parse(val).updatedAt)
            };
        } catch  {
            throw new Error("cursor must be a valid JSON string");
        }
    }).optional(),
    query: z.string().nonempty().optional(),
    collection: SelectCollectionDto.shape.slug
});

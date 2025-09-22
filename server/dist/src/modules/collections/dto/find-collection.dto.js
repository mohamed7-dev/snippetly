import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto.js";
import { SelectCollectionDto } from "./select-collection.dto.js";
import { LIMIT_SCHEMA } from "../../../common/lib/zod.js";
export const FindCollectionsDto = z.object({
    limit: LIMIT_SCHEMA,
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
    creatorName: SelectUserDto.shape.name
});
// Find one
export const FindCollectionDto = z.object({
    slug: SelectCollectionDto.shape.slug
});
// Discover
export const DiscoverCollectionsDto = z.object({
    limit: LIMIT_SCHEMA,
    cursor: z.string().transform((val)=>{
        try {
            return {
                updatedAt: new Date(JSON.parse(val).updatedAt)
            };
        } catch  {
            throw new Error("cursor must be a valid JSON string");
        }
    }).optional(),
    query: z.string().nonempty().optional()
});

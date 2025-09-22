import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto.ts";
import { SelectCollectionDto } from "./select-collection.dto.ts";
import { LIMIT_SCHEMA } from "../../../common/lib/zod.ts";

export const FindCollectionsDto = z.object({
  limit: LIMIT_SCHEMA,
  cursor: z
    .string()
    .transform((val) => {
      try {
        return { updatedAt: new Date(JSON.parse(val).updatedAt) };
      } catch {
        throw new Error("cursor must be a valid JSON string");
      }
    })
    .optional(),
  query: z.string().nonempty().optional(),
  creatorName: SelectUserDto.shape.name,
});

export type FindCollectionsDtoType = z.infer<typeof FindCollectionsDto>;

// Find one
export const FindCollectionDto = z.object({
  slug: SelectCollectionDto.shape.slug,
});
export type FindCollectionDtoType = z.infer<typeof FindCollectionDto>;

// Discover
export const DiscoverCollectionsDto = z.object({
  limit: LIMIT_SCHEMA,
  cursor: z
    .string()
    .transform((val) => {
      try {
        return { updatedAt: new Date(JSON.parse(val).updatedAt) };
      } catch {
        throw new Error("cursor must be a valid JSON string");
      }
    })
    .optional(),
  query: z.string().nonempty().optional(),
});

export type DiscoverCollectionsDtoType = z.infer<typeof DiscoverCollectionsDto>;

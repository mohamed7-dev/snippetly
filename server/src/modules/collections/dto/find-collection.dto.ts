import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto";
import { SelectCollectionDto } from "./select-collection.dto";

export const FindCollectionsDto = z.object({
  limit: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => val > 0 && val < 100)
    .optional(),
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
  creator: SelectUserDto.shape.name,
});

export type FindCollectionsDtoType = z.infer<typeof FindCollectionsDto>;

// Find one
export const FindCollectionDto = z.object({
  slug: SelectCollectionDto.shape.slug,
});
export type FindCollectionDtoType = z.infer<typeof FindCollectionDto>;

// Discover

export const DiscoverCollectionsDto = z.object({
  limit: z.number().min(1).max(100).optional(),
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

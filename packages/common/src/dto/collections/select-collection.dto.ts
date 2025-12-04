import { baseModelSchema, z } from "../zod";

export const SelectCollectionDto = baseModelSchema.extend({
  title: z.string(),
  slug: z.string(),
  oldSlugs: z.array(z.string()),

  description: z.string().nullish(),

  color: z.string(),

  isPrivate: z.boolean(),
  allowForking: z.boolean(),

  forkedFrom: z.number().int().nullish(),

  creatorId: z.number().int(),
});

export type SelectCollectionDtoType = z.infer<typeof SelectCollectionDto>;

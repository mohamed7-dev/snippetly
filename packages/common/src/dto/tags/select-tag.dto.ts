import { baseModelSchema, z } from "../zod";

export const SelectTagDto = baseModelSchema.extend({
  name: z.string(),

  usageCount: z.number().int(),

  addedBy: z.number().int().nullable().optional(),
});

export type SelectTagDtoType = z.infer<typeof SelectTagDto>;

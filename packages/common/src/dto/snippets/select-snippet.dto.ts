import { baseModelSchema, z } from "../zod";

export const SelectSnippetDto = baseModelSchema.extend({
  title: z.string(),
  slug: z.string(),
  oldSlugs: z.array(z.string()),

  code: z.string(),
  language: z.string(),

  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),

  isPrivate: z.boolean(),
  allowForking: z.boolean(),

  forkedFrom: z.number().int().nullable().optional(),

  creatorId: z.number().int(),
  collectionId: z.number().int(),
});

import { baseModelSchema, z } from "../zod";

export const SelectCollectionDto = baseModelSchema.extend({
  title: z.string().nonempty(),
  slug: z.string().nonempty(),
  color: z.string().nonempty(),
});

export type SelectCollectionDtoType = z.infer<typeof SelectCollectionDto>;

import { baseModelSchema, z } from "../zod";

export const SelectTagDto = baseModelSchema.extend({
  name: z.string().nonempty(),
});

export type SelectTagDtoType = z.infer<typeof SelectTagDto>;

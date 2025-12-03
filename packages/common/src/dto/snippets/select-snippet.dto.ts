import { baseModelSchema, z } from "../zod";

export const SelectSnippetDto = baseModelSchema.extend({
  title: z.string().nonempty(),
  slug: z.string().nonempty(),
  language: z.string().nonempty(),
});

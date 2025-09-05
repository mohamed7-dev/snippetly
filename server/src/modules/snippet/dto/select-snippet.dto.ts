import z from "zod";
import { baseModelSchema, ObjectIdStringSchema } from "../../../common/lib/zod";

export const SelectSnippetDto = baseModelSchema.extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  parseFormat: z.string().min(1, "Parse format is required"),
  isPrivate: z.boolean().default(false),

  owner: ObjectIdStringSchema,
  collection: ObjectIdStringSchema,
  sharedWith: z.array(ObjectIdStringSchema).default([]),
});

export type SelectSnippetDtoType = z.infer<typeof SelectSnippetDto>;

import z from "zod";
import { baseModelSchema, objectIdSchema } from "../../../common/lib/zod";

export const SelectFolderDto = baseModelSchema.extend({
  title: z.string().min(1, "Title is required"),
  code: z.string().min(1, "Code is required"),
  color: z.string().min(1, "Color is required"),
  description: z.string().optional(),
  isPrivate: z.boolean(),
  allowForking: z.boolean(),
  owner: objectIdSchema,
  snippets: z.array(objectIdSchema).default([]),
  tags: z.array(objectIdSchema).default([]),
});

export type SelectFolderDtoType = z.infer<typeof SelectFolderDto>;

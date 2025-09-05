import z from "zod";
import { baseModelSchema, ObjectIdStringSchema } from "../../../common/lib/zod";

export const SelectCollectionDto = baseModelSchema.extend({
  title: z.string().min(1, "Title is required"),
  code: z.string().min(1, "Code is required"),
  owner: ObjectIdStringSchema,
  snippets: z.array(ObjectIdStringSchema),
});

export type SelectCollectionDtoType = z.infer<typeof SelectCollectionDto>;

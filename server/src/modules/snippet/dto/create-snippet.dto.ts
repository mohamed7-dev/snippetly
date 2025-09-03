import z from "zod";
import { ObjectIdStringSchema } from "../../../common/lib/zod";

// TODO: change min of the owner field to match object id
export const CreateSnippetDto = z.object({
  title: z.string().min(1, { error: "Title is required." }),
  description: z.string().optional(),
  code: z.string().min(1, { error: "Code is required." }),
  parseFormat: z.string().min(1, { error: "Parse format is required." }),
  isPrivate: z.boolean().optional(),
  collection: ObjectIdStringSchema,
});
export type CreateSnippetDtoType = z.infer<typeof CreateSnippetDto>;

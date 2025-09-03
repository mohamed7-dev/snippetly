import z from "zod";
import { CreateSnippetDto } from "./create-snippet.dto";

export const UpdateSnippetDto = z.object({
  slug: z.string().nonempty(),
  data: CreateSnippetDto.pick({
    title: true,
    description: true,
    isPrivate: true,
  }).extend({
    title: CreateSnippetDto.shape.title.optional(),
  }),
});

export type UpdateSnippetDtoType = z.infer<typeof UpdateSnippetDto>;

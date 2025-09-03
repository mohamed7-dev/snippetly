import z from "zod";

export const DeleteSnippetDto = z.object({
  slug: z.string().nonempty(),
});

export type DeleteSnippetDtoType = z.infer<typeof DeleteSnippetDto>;

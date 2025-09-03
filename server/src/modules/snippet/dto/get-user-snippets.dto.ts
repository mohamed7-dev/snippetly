import z from "zod";

export const GetUserSnippetsDto = z.object({
  name: z.string().nonempty(),
});

export type GetUserSnippetsDtoType = z.infer<typeof GetUserSnippetsDto>;

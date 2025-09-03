import z from "zod";

export const CreateCollectionDto = z.object({
  title: z.string().min(1, { error: "Title is required." }),
});

export type CreateCollectionDtoType = z.infer<typeof CreateCollectionDto>;

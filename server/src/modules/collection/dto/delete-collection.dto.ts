import z from "zod";

export const DeleteCollectionDto = z.object({
  code: z.string().nonempty(),
});

export type DeleteCollectionDtoType = z.infer<typeof DeleteCollectionDto>;

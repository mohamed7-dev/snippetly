import z from "zod";

export const SelectTagDto = z.object({
  name: z.string().nonempty().min(1, "Name can't be empty."),
  description: z.string().optional(),
});

export type SelectTagDtoType = z.infer<typeof SelectTagDto>;

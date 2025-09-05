import z from "zod";

export const SendVEmailDto = z.object({
  email: z.email(),
});

export type SendVEmailDtoType = z.infer<typeof SendVEmailDto>;

import z from "zod";

export const SendREmailDto = z.object({
  email: z.email(),
});

export type SendREmailDtoType = z.infer<typeof SendREmailDto>;

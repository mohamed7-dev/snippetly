import z from "zod";

export const VerifyTokenDto = z.object({
  token: z.uuidv4().nonempty(),
});
export type VerifyTokenDtoType = z.infer<typeof VerifyTokenDto>;

import z from "zod";
import { SignupDto } from "./signup.dto";

export const LoginDto = SignupDto.pick({
  password: true,
}).extend({
  name: z
    .string()
    .min(3, { error: "Make sure name is at least three characters long." }),
});

export type LoginDtoType = z.infer<typeof LoginDto>;

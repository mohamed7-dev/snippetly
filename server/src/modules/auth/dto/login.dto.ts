import z from "zod";
import { SignupDto } from "./signup.dto";

export const LoginDto = SignupDto.pick({
  password: true,
  name: true,
}).extend({
  rememberMe: z.boolean().optional(),
});

export type LoginDtoType = z.infer<typeof LoginDto>;

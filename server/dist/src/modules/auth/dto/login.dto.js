import z from "zod";
import { SignupDto } from "./signup.dto.js";
export const LoginDto = SignupDto.pick({
    password: true,
    name: true
}).extend({
    rememberMe: z.boolean().optional()
});

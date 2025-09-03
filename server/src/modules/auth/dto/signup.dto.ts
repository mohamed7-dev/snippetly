import { z } from "zod";
import { CreateUserDto } from "../../user/dto/create-user.dto";

export const SignupDto = CreateUserDto;

export type SignupDtoType = z.infer<typeof SignupDto>;

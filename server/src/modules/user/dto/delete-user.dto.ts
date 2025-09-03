import z from "zod";
import { SignupDto } from "../../auth/dto/signup.dto";

export const DeleteUserDto = z.object({
  name: SignupDto.shape.name,
});
export type DeleteUserDtoType = z.infer<typeof DeleteUserDto>;

import z from "zod";
import { UpdateUserPasswordDto } from "../../user/dto/update-password.dto";

export const ResetPasswordDto = z.object({
  password: UpdateUserPasswordDto.shape.password,
});

export type ResetPasswordDtoType = Required<z.infer<typeof ResetPasswordDto>>;

import z from "zod";
import { UpdateUserPasswordDto } from "../../user/dto/update-password.dto.ts";

export const ResetPasswordDto = z.object({
  password: UpdateUserPasswordDto.shape.newPassword,
});

export type ResetPasswordDtoType = Required<z.infer<typeof ResetPasswordDto>>;

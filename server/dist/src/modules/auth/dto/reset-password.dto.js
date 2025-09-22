import z from "zod";
import { UpdateUserPasswordDto } from "../../user/dto/update-password.dto.js";
export const ResetPasswordDto = z.object({
    password: UpdateUserPasswordDto.shape.newPassword
});

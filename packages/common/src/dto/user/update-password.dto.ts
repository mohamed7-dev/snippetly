import { STRONG_PASSWORD_SCHEMA, z } from "../zod";
import { SelectUserDto } from "./select-user.dto";

// Update User Password DTO
export const UpdateUserPasswordDto = z.object({
  currentPassword: STRONG_PASSWORD_SCHEMA,
  newPassword: STRONG_PASSWORD_SCHEMA,
  email: SelectUserDto.shape.email,
});
export type UpdateUserPasswordDtoType = z.infer<typeof UpdateUserPasswordDto>;

// Forget Password DTO
export const ForgetPasswordDto = UpdateUserPasswordDto.partial({
  currentPassword: true,
});
export type ForgetPasswordDtoType = z.infer<typeof ForgetPasswordDto>;

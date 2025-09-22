import z from "zod";
import { STRONG_PASSWORD_SCHEMA } from "../../../common/lib/zod.ts";
import { SelectUserDto } from "./select-user.dto.ts";

export const UpdateUserPasswordDto = z.object({
  // current password is optional in case of forgetting password
  currentPassword: STRONG_PASSWORD_SCHEMA.optional(),
  newPassword: STRONG_PASSWORD_SCHEMA,
  email: SelectUserDto.shape.email,
});
export type UpdateUserPasswordDtoType = z.infer<typeof UpdateUserPasswordDto>;

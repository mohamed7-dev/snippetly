import z from "zod";
import { STRONG_PASSWORD_SCHEMA } from "../../../common/lib/zod.js";
import { SelectUserDto } from "./select-user.dto.js";
export const UpdateUserPasswordDto = z.object({
    // current password is optional in case of forgetting password
    currentPassword: STRONG_PASSWORD_SCHEMA.optional(),
    newPassword: STRONG_PASSWORD_SCHEMA,
    email: SelectUserDto.shape.email
});

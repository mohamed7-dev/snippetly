import z from "zod";
import { STRONG_PASSWORD_SCHEMA } from "../../../common/lib/zod";
import { SelectUserDto } from "./select-user.dto";

export const UpdateUserPasswordDto = z.object({
  password: STRONG_PASSWORD_SCHEMA,
  email: SelectUserDto.shape.email,
});
export type UpdateUserPasswordDtoType = z.infer<typeof UpdateUserPasswordDto>;

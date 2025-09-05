import z from "zod";
import { STRONG_PASSWORD_SCHEMA } from "../../../common/lib/zod";

export const UpdateUserPasswordDto = z.object({
  password: STRONG_PASSWORD_SCHEMA,
});
export type UpdateUserPasswordDtoType = z.infer<typeof UpdateUserPasswordDto>;

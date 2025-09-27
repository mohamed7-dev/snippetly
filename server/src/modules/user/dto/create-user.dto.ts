import { z } from "zod";
import { SelectUserDto } from "./select-user.dto";
import { STRONG_PASSWORD_SCHEMA } from "../../../common/lib/zod";

export const CreateUserDto = SelectUserDto.pick({
  firstName: true,
  lastName: true,
  name: true,
  password: true,
  email: true,
  acceptedPolicies: true,
  isPrivate: true,
}).extend({ password: STRONG_PASSWORD_SCHEMA });

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;

import z from "zod";
import { SelectUserDto } from "./select-user.dto.ts";
import { UpdateUserPasswordDto } from "./update-password.dto.ts";

export const UpdateUserDto = SelectUserDto.pick({
  // name: true,
  firstName: true,
  lastName: true,
  bio: true,
  image: true,
  isPrivate: true,
  email: true,
})
  .extend(UpdateUserPasswordDto.omit({ email: true }).shape)
  .partial();

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;

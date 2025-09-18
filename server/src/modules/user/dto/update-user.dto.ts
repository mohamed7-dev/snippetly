import z from "zod";
import { SelectUserDto } from "./select-user.dto";

export const UpdateUserDto = SelectUserDto.pick({
  name: true,
  firstName: true,
  lastName: true,
  bio: true,
  image: true,
  isPrivate: true,
}).partial();

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;

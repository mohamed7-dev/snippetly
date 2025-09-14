import z from "zod";
import { SelectUserDto } from "./select-user.dto";

export const DeleteUserDto = z.object({
  name: SelectUserDto.shape.name,
});

export type DeleteUserDtoType = z.infer<typeof DeleteUserDto>;

import z from "zod";
import { SelectUserDto } from "./select-user.dto";

export const DeleteUserParamDto = z.object({
  name: SelectUserDto.shape.name,
});

export type DeleteUserParamDtoType = z.infer<typeof DeleteUserParamDto>;

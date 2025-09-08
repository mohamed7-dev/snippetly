import z from "zod";
import { CreateUserDto } from "./create-user.dto";
import { SelectUserDto } from "./select-user.dto";

export const UpdateUserDto = z.object({
  name: SelectUserDto.shape.name,
  data: z.object({
    firstName: CreateUserDto.shape.firstName.optional(),
    lastName: CreateUserDto.shape.lastName.optional(),
    name: CreateUserDto.shape.name.optional(),
  }),
});

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;

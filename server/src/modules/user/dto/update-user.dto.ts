import z from "zod";
import { CreateUserDto } from "./create-user.dto";

export const UpdateUserDto = z.object({
  name: CreateUserDto.shape.name,
  data: z.object({
    firstName: CreateUserDto.shape.firstName.optional(),
    lastName: CreateUserDto.shape.lastName.optional(),
    name: CreateUserDto.shape.name.optional(),
    password: CreateUserDto.shape.password.optional(),
    email: CreateUserDto.shape.email.optional(),
  }),
});
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;

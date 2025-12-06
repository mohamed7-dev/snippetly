import { z } from "../zod";
import { SelectUserDto } from "./select-user.dto";

// Create User DTO
export const CreateUserDto = SelectUserDto.pick({
  name: true,
  password: true,
  email: true,
  acceptedPolicies: true,
  isPrivate: true,
}).partial({
  isPrivate: true,
  acceptedPolicies: true,
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;

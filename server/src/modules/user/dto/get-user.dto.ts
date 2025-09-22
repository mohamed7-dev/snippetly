import z from "zod";
import { CreateUserDto } from "./create-user.dto.ts";

export const GetUserDto = z.object({
  name: CreateUserDto.shape.name,
});
export type GetUserDtoType = z.infer<typeof GetUserDto>;

import z from "zod";
import { CreateUserDto } from "./create-user.dto";

export const GetOneParamDto = z.object({
  name: CreateUserDto.shape.name,
});
export type GetOneParamDtoType = z.infer<typeof GetOneParamDto>;

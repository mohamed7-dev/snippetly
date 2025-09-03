import z from "zod";
import { CreateUserDto } from "./create-user.dto";

export const GetOneDto = z.object({
  name: CreateUserDto.shape.name,
});
export type GetOneDtoType = z.infer<typeof GetOneDto>;

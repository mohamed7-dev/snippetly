import z from "zod";
import { CreateUserDto } from "./create-user.dto.js";
export const GetUserDto = z.object({
    name: CreateUserDto.shape.name
});

import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto.js";
export const SendREmailDto = z.object({
    email: SelectUserDto.shape.email
});

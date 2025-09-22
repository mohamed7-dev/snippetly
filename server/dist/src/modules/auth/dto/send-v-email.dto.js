import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto.js";
export const SendVEmailDto = z.object({
    email: SelectUserDto.shape.email
});

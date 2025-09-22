import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto.js";
export const VerifyTokenDto = z.object({
    token: SelectUserDto.shape.emailVerificationToken.refine((val)=>val !== null && val !== undefined)
});

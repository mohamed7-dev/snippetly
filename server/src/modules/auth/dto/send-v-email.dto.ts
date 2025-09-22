import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto.ts";

export const SendVEmailDto = z.object({
  email: SelectUserDto.shape.email,
});

export type SendVEmailDtoType = z.infer<typeof SendVEmailDto>;

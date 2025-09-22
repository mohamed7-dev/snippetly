import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto.ts";

export const SendREmailDto = z.object({
  email: SelectUserDto.shape.email,
});

export type SendREmailDtoType = z.infer<typeof SendREmailDto>;

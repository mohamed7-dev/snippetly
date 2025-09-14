import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto";

export const VerifyTokenDto = z.object({
  token: SelectUserDto.shape.emailVerificationToken.refine(
    (val) => val !== null && val !== undefined
  ),
});
export type VerifyTokenDtoType = z.infer<typeof VerifyTokenDto> & {
  token: string;
};

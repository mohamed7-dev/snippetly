import z from "zod";
import { SignupDto } from "../../auth/dto/signup.dto";

export const SendFriendshipRequestDto = z.object({
  name: SignupDto.shape.name,
  friendName: SignupDto.shape.name,
});
export type SendFriendshipRequestDtoType = z.infer<
  typeof SendFriendshipRequestDto
>;

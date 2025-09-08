import z from "zod";
import { SelectUserDto } from "./select-user.dto";

export const FriendshipParamDto = z.object({
  friend_name: SelectUserDto.shape.name,
});
export type FriendshipParamDtoType = z.infer<typeof FriendshipParamDto>;

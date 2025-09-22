import z from "zod";
import { SelectUserDto } from "./select-user.dto.ts";

export const ManageFriendshipDto = z.object({
  friend_name: SelectUserDto.shape.name,
});
export type ManageFriendshipDtoType = z.infer<typeof ManageFriendshipDto>;

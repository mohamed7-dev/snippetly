import z from "zod";
import { SelectUserDto } from "./select-user.dto.js";
export const ManageFriendshipDto = z.object({
    friend_name: SelectUserDto.shape.name
});

import { SelectUserDto } from "./select-user.dto.js";
import { UpdateUserPasswordDto } from "./update-password.dto.js";
export const UpdateUserDto = SelectUserDto.pick({
    // name: true,
    firstName: true,
    lastName: true,
    bio: true,
    image: true,
    imageCustomId: true,
    imageKey: true,
    isPrivate: true,
    email: true
}).extend(UpdateUserPasswordDto.omit({
    email: true
}).shape).partial();

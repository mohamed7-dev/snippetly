import { SelectUserDto } from "./select-user.dto.js";
import { STRONG_PASSWORD_SCHEMA } from "../../../common/lib/zod.js";
export const CreateUserDto = SelectUserDto.pick({
    firstName: true,
    lastName: true,
    name: true,
    password: true,
    email: true,
    acceptedPolicies: true,
    isPrivate: true
}).extend({
    password: STRONG_PASSWORD_SCHEMA
});

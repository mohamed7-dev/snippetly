"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgetPasswordDto = exports.UpdateUserPasswordDto = void 0;
var zod_1 = require("../zod");
var select_user_dto_1 = require("./select-user.dto");
// Update User Password DTO
exports.UpdateUserPasswordDto = zod_1.z.object({
    currentPassword: zod_1.STRONG_PASSWORD_SCHEMA,
    newPassword: zod_1.STRONG_PASSWORD_SCHEMA,
    email: select_user_dto_1.SelectUserDto.shape.email,
});
// Forget Password DTO
exports.ForgetPasswordDto = exports.UpdateUserPasswordDto.partial({
    currentPassword: true,
});
//# sourceMappingURL=update-password.dto.js.map
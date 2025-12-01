"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
var select_user_dto_1 = require("./select-user.dto");
// Create User DTO
exports.CreateUserDto = select_user_dto_1.SelectUserDto.pick({
    name: true,
    password: true,
    email: true,
    acceptedPolicies: true,
    isPrivate: true,
});
//# sourceMappingURL=create-user.dto.js.map
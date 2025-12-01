"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserResponseDto = exports.UpdateUserSuccessResponseDto = exports.UpdateUserRequestDto = void 0;
var common_1 = require("./common");
var zod_1 = require("../zod");
var common_2 = require("./common");
var select_user_dto_1 = require("./select-user.dto");
var update_password_dto_1 = require("./update-password.dto");
// Update User Request
exports.UpdateUserRequestDto = select_user_dto_1.SelectUserDto.pick({
    firstName: true,
    lastName: true,
    bio: true,
    image: true,
    imageCustomId: true,
    imageKey: true,
    isPrivate: true,
    email: true,
})
    .extend(update_password_dto_1.UpdateUserPasswordDto.omit({ email: true }).shape)
    .partial()
    .meta({
    id: "UpdateUserRequestBody",
    description: "update user request body",
    example: {
        firstName: "updated first name",
        lastName: "updated last name",
        bio: "updated bio",
        image: "url",
        imageCustomId: "id",
        imageKey: "key",
        isPrivate: true,
        email: "test@example.com",
    },
});
// Update User Response
exports.UpdateUserSuccessResponseDto = (0, zod_1.createSuccessResponse)(common_2.CommonUserResDto, "UpdateUserSuccessResponseBody", "Update user success response body", __assign({}, common_1.CommonUserResDtoExample), "User info has been updated successfully");
exports.UpdateUserResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.UpdateUserSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=update-user.dto.js.map
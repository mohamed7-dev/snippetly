"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedRouteHeadersSchema = exports.protectedRouteCookiesSchema = exports.VerifyTokenRequestDto = exports.SendTokenViaEmailDto = exports.CommonAuthResponseDtoExample = exports.CommonAuthResponseDto = void 0;
var select_user_dto_1 = require("../user/select-user.dto");
var zod_1 = require("../zod");
var CommonUserResponse = select_user_dto_1.SelectUserDto.pick({
    name: true,
    firstName: true,
    lastName: true,
    email: true,
    image: true,
    imageCustomId: true,
    imageKey: true,
    isPrivate: true,
    createdAt: true,
    updatedAt: true,
});
var CommonUserResDtoExample = {
    name: "John_doe7",
    firstName: "John",
    lastName: "Doe",
    image: "https://uploadthing...",
    imageKey: "{{key}}",
    email: "test@example.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPrivate: false,
};
exports.CommonAuthResponseDto = zod_1.z.object({
    user: CommonUserResponse,
    accessToken: zod_1.z.jwt(),
});
exports.CommonAuthResponseDtoExample = {
    user: CommonUserResDtoExample,
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
};
exports.SendTokenViaEmailDto = select_user_dto_1.SelectUserDto.pick({
    email: true,
});
exports.VerifyTokenRequestDto = zod_1.z.object({
    token: zod_1.z.uuidv4(),
});
exports.protectedRouteCookiesSchema = zod_1.z.object({
    "refresh-token": zod_1.z.string(),
});
exports.protectedRouteHeadersSchema = zod_1.z.object({
    authorization: zod_1.z.string(),
});
//# sourceMappingURL=common.js.map
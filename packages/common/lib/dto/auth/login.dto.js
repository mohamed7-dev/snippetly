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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResponseDto = exports.LoginSuccessResponseDto = exports.LoginRequestDto = void 0;
var zod_1 = __importDefault(require("zod"));
var zod_2 = require("../zod");
var signup_dto_1 = require("./signup.dto");
var common_1 = require("./common");
// Login Request DTO
exports.LoginRequestDto = signup_dto_1.SignupRequestDto.pick({
    password: true,
    name: true,
})
    .extend({
    rememberMe: zod_1.default.boolean().optional(),
})
    .meta({
    id: "LoginRequestBody",
    description: "Login request body",
    example: {
        name: "alice",
        password: "Password@12345678",
        rememberMe: true,
    },
});
// Login Response Schemas
exports.LoginSuccessResponseDto = (0, zod_2.createSuccessResponse)(common_1.CommonAuthResponseDto, "LoginSuccessResponseBody", "Login response body when login is successful", __assign({}, common_1.CommonAuthResponseDtoExample), "Successfully authenticated");
exports.LoginResponseDto = zod_1.default.discriminatedUnion("type", [
    exports.LoginSuccessResponseDto,
    zod_2.GlobalErrorResponseDto,
]);
//# sourceMappingURL=login.dto.js.map
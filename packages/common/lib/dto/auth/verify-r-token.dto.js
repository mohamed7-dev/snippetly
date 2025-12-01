"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyRTokenResponseDto = exports.VerifyRTokenSuccessResponseDto = exports.VerifyRTokenRequestBodyDto = exports.VerifyRTokenRequestQueryDto = void 0;
var select_user_dto_1 = require("../user/select-user.dto");
var zod_1 = require("../zod");
var common_1 = require("./common");
// Verify R Token Request Schema <Query Param>
exports.VerifyRTokenRequestQueryDto = common_1.VerifyTokenRequestDto.meta({
    id: "VerifyRTokenRequestQuery",
    description: "Verify password reset token request query param",
    example: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
});
// Verify R Token Request Schema <Body>
exports.VerifyRTokenRequestBodyDto = zod_1.z
    .object({
    password: select_user_dto_1.SelectUserDto.shape.password,
})
    .meta({
    id: "VerifyRTokenRequestBody",
    description: "Verify password reset token request body",
    example: {
        password: "super-secure-password",
    },
});
// Verify V Token Response Schema
exports.VerifyRTokenSuccessResponseDto = (0, zod_1.createSuccessResponse)(zod_1.z.null(), "VerifyPasswordRTokenSuccessResponse", "password reset response body", null, "Password has been reset successfully");
exports.VerifyRTokenResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.VerifyRTokenSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=verify-r-token.dto.js.map
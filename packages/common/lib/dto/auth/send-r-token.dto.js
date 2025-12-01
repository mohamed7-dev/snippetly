"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendRTokenResponseDto = exports.SendRTokenSuccessResponseDto = exports.SendRTokenRequestDto = void 0;
var zod_1 = require("../zod");
var common_1 = require("./common");
// Send Reset Token Request Schema
exports.SendRTokenRequestDto = common_1.SendTokenViaEmailDto.meta({
    id: "SendRTokenRequestBody",
    description: "Send reset password token request body",
    example: {
        email: "test@example.com",
    },
});
// Send Reset Token Response Schema
exports.SendRTokenSuccessResponseDto = (0, zod_1.createSuccessResponse)(zod_1.z.null(), "SendRTokenSuccessResponseBody", "Password reset link has been sent to the email.", null, "Password reset link has been sent to '${email}', check your inbox to reset your password.");
exports.SendRTokenResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.SendRTokenSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=send-r-token.dto.js.map
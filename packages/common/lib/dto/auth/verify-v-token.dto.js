"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyVTokenResponseDto = exports.VerifyVTokenSuccessResponseDto = exports.VerifyVTokenRequestDto = void 0;
var zod_1 = require("../zod");
var common_1 = require("./common");
// Verify V Token Request Schema
exports.VerifyVTokenRequestDto = common_1.VerifyTokenRequestDto.meta({
    id: "VerifyEmailVTokenRequestQuery",
    description: "Verify email verification token request query param",
    example: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
});
// Verify V Token Response Schema
exports.VerifyVTokenSuccessResponseDto = (0, zod_1.createSuccessResponse)(zod_1.z.null(), "VerifyEmailVTokenSuccessResponse", "Email verification response body", null, "Email has been verified successfully");
exports.VerifyVTokenResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.VerifyVTokenSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=verify-v-token.dto.js.map
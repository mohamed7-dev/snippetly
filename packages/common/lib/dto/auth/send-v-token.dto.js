"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendVEmailResponseDto = exports.SendVEmailSuccessResponseDto = exports.SendVEmailRequestDto = void 0;
var zod_1 = require("../zod");
var common_1 = require("./common");
// Send V Email Request Schema
exports.SendVEmailRequestDto = common_1.SendTokenViaEmailDto.meta({
    id: "SendVEmailTokenRequestBody",
    description: "Send email verification token request body",
    example: {
        email: "test@example.com",
    },
});
// Send V Email Response Schema
exports.SendVEmailSuccessResponseDto = (0, zod_1.createSuccessResponse)(zod_1.z.null(), "SendVEmailSuccessResponseBody", "Verification link has been sent the email.", null, "Email verification has been sent to '${email}', check your inbox to verify your account.");
exports.SendVEmailResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.SendVEmailSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=send-v-token.dto.js.map
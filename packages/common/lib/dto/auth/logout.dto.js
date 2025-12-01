"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutResponseDto = exports.LogoutSuccessResponseDto = void 0;
var zod_1 = require("../zod");
// Logout Response Schema
exports.LogoutSuccessResponseDto = (0, zod_1.createSuccessResponse)(zod_1.z.null(), "LogoutSuccessResponse", "Logged out successfully, and sessions is terminated.", null, "Logged out successfully.");
exports.LogoutResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.LogoutSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=logout.dto.js.map
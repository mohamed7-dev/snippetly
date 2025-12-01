"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserResponseDto = exports.DeleteUserSuccessResponseDto = void 0;
var zod_1 = require("../zod");
// Delete User Response
exports.DeleteUserSuccessResponseDto = (0, zod_1.createSuccessResponse)(zod_1.z.null(), "DeleteUserSuccessResponseBody", "Delete user success response body", null, "User account has been deleted successfully");
exports.DeleteUserResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.DeleteUserSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=delete-user.dto.js.map
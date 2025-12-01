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
exports.RefreshTokenResponseDto = exports.RefreshTokenSuccessResponseDto = void 0;
var zod_1 = require("../zod");
var common_1 = require("./common");
// Refresh Token Response Schemas
exports.RefreshTokenSuccessResponseDto = (0, zod_1.createSuccessResponse)(common_1.CommonAuthResponseDto, "RefreshTokenSuccessResponse", "Access token has been generated successfully from the refresh token.", __assign({}, common_1.CommonAuthResponseDtoExample), "Access token has been refreshed successfully.");
exports.RefreshTokenResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.RefreshTokenSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=refresh-token.dto.js.map
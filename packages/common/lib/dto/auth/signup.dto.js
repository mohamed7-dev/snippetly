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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupResponseDto = exports.SignupSuccessResponseDto = exports.SignupConflictResponseDto = exports.SignupRequestDto = void 0;
var create_user_dto_1 = require("../user/create-user.dto");
var zod_1 = require("../zod");
var zod_2 = require("../zod");
var common_1 = require("./common");
// Signup Request DTO
exports.SignupRequestDto = create_user_dto_1.CreateUserDto.meta({
    id: "SignupRequestBody",
    description: "Signup request body",
    example: {
        name: "alice",
        password: "Password@12345678",
        email: "alice@snippetly.com",
        acceptedPolicies: true,
        isPrivate: false,
    },
});
// Signup Response Schemas
exports.SignupConflictResponseDto = (0, zod_1.createConflictResponse)(zod_1.z.object({
    suggestedNames: zod_1.z.array(zod_1.z.string()),
}), "SignupConflictResponse", "Signup response body when conflict exists", {
    suggestedNames: ["alice-1", "alice-3", "alice-4"],
}, "User account with the same name '${name}' already exists, but you can use one of the generated names.");
var accessToken = common_1.CommonAuthResponseDtoExample.accessToken, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_a = common_1.CommonAuthResponseDtoExample.user, updatedAt = _a.updatedAt, userResExample = __rest(_a, ["updatedAt"]);
exports.SignupSuccessResponseDto = (0, zod_2.createSuccessResponse)(zod_1.z.object({
    user: common_1.CommonAuthResponseDto.shape.user.omit({
        updatedAt: true,
    }),
    accessToken: common_1.CommonAuthResponseDto.shape.accessToken,
}), "SignupSuccessResponse", "Signup response body when conflict does not exist", {
    accessToken: accessToken,
    user: __assign({}, userResExample),
}, "User account has been created successfully.", 201);
exports.SignupResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.SignupSuccessResponseDto,
    exports.SignupConflictResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=signup.dto.js.map
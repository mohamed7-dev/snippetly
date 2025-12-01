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
exports.GetCurrentUserResponseDto = exports.GetUserResponseDto = exports.GetPublicUserSuccessResponseDto = exports.GetUserSuccessResponseDto = exports.GetUserRequestDto = void 0;
var zod_1 = require("../zod");
var common_1 = require("./common");
var create_user_dto_1 = require("./create-user.dto");
var select_friendship_dto_1 = require("./select-friendship.dto");
// Get User Request
exports.GetUserRequestDto = zod_1.z
    .object({
    name: create_user_dto_1.CreateUserDto.shape.name,
})
    .meta({
    id: "GetUserRequestBody",
    description: "Get user request param",
    example: {
        name: "John_doe7",
    },
});
// Get User Response
var GetUserProfileSuccessResponseDto = zod_1.z.object({
    profile: common_1.CommonUserResDto,
    stats: common_1.UserActivityStatsDto,
});
exports.GetUserSuccessResponseDto = (0, zod_1.createSuccessResponse)(GetUserProfileSuccessResponseDto.extend({
    type: zod_1.z.literal("owner-success"),
}), "GetUserProfileSuccessResponseBody", "Get user profile success response body, tailored to the account owner", __assign({}, common_1.CommonUserResDtoExample), "Fetched successfully");
var GetPublicUserProfileSuccessResponseDto = GetUserProfileSuccessResponseDto.extend({
    friendshipInfo: zod_1.z.object({
        isCurrentUserAFriend: zod_1.z.boolean(),
        requestStatus: select_friendship_dto_1.SelectFriendshipDto.shape.status.nullish(),
    }),
    profile: GetUserProfileSuccessResponseDto.shape.profile.omit({
        emailVerifiedAt: true,
        updatedAt: true,
        isPrivate: true,
    }),
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var emailVerifiedAt = common_1.CommonUserResDtoExample.emailVerifiedAt, updatedAt = common_1.CommonUserResDtoExample.updatedAt, isPrivate = common_1.CommonUserResDtoExample.isPrivate, publicUserResDtoExample = __rest(common_1.CommonUserResDtoExample, ["emailVerifiedAt", "updatedAt", "isPrivate"]);
exports.GetPublicUserSuccessResponseDto = (0, zod_1.createSuccessResponse)(GetPublicUserProfileSuccessResponseDto.extend({
    type: zod_1.z.literal("public-success"),
}), "GetPublicUserProfileSuccessResponseBody", "Get user profile success response body, tailored to a guest", __assign({}, publicUserResDtoExample), "Fetched successfully");
exports.GetUserResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.GetUserSuccessResponseDto,
    exports.GetPublicUserSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
// Get Current User Response <The Same As Owner Response>
exports.GetCurrentUserResponseDto = zod_1.z.discriminatedUnion("type", [
    exports.GetUserSuccessResponseDto,
    zod_1.GlobalErrorResponseDto,
]);
//# sourceMappingURL=get-user.dto.js.map
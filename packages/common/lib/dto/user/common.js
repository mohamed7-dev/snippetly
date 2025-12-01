"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivityStatsDto = exports.CommonUserResDtoExample = exports.CommonUserResDto = void 0;
var zod_1 = require("../zod");
var select_user_dto_1 = require("./select-user.dto");
exports.CommonUserResDto = select_user_dto_1.SelectUserDto.pick({
    name: true,
    firstName: true,
    lastName: true,
    image: true,
    imageKey: true,
    bio: true,
    email: true,
    emailVerifiedAt: true,
    createdAt: true,
    updatedAt: true,
    isPrivate: true,
});
exports.CommonUserResDtoExample = {
    name: "John_doe7",
    firstName: "John",
    lastName: "Doe",
    image: "https://uploadthing...",
    imageKey: "{{key}}",
    bio: "I'm a full-stack developer",
    email: "test@example.com",
    emailVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPrivate: false,
};
// User Activity Stats
exports.UserActivityStatsDto = zod_1.z.object({
    snippetsCount: zod_1.z.number(),
    collectionsCount: zod_1.z.number(),
    forkedSnippetsCount: zod_1.z.number(),
    forkedCollectionsCount: zod_1.z.number(),
    friendsCount: zod_1.z.number(),
    friendsInboxCount: zod_1.z.number(),
    friendsOutboxCount: zod_1.z.number(),
});
//# sourceMappingURL=common.js.map
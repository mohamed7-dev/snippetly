"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCurrentUserFriendsDto = void 0;
var zod_1 = require("../zod");
// Get User's Inbox/Outbox/Friends
exports.GetCurrentUserFriendsDto = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).optional(),
    cursor: zod_1.baseModelSchema.pick({ id: true }).optional(),
    query: zod_1.z.string().nonempty().optional(),
});
//# sourceMappingURL=get-current-user-friends.dto.js.map
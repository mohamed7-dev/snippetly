"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageFriendshipDto = void 0;
var zod_1 = require("../zod");
var select_user_dto_1 = require("./select-user.dto");
exports.ManageFriendshipDto = zod_1.z.object({
    friend_name: select_user_dto_1.SelectUserDto.shape.name,
});
//# sourceMappingURL=manage-friendship.dto.js.map
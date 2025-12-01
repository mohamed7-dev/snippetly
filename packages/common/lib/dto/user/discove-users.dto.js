"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoverUsersDto = void 0;
var zod_1 = require("../zod");
exports.DiscoverUsersDto = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).optional(),
    cursor: zod_1.z
        .string()
        .transform(function (val) {
        try {
            var parsed = JSON.parse(val);
            return {
                snippetsCount: Number(parsed.snippetsCount),
                id: Number(parsed.id),
            };
        }
        catch (_a) {
            throw new Error("cursor must be a valid JSON string");
        }
    })
        .optional(),
    query: zod_1.z.string().nonempty().optional(),
});
//# sourceMappingURL=discove-users.dto.js.map
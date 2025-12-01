"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectUserDto = void 0;
var zod_1 = require("../zod");
// Select User DTO
var nameSchema = zod_1.z
    .string()
    .min(1, { message: "Name is required" })
    .regex(/^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/, {
    message: "Name can only contain letters, numbers, and use '-' or '_' as separators",
});
exports.SelectUserDto = zod_1.baseModelSchema.extend({
    name: nameSchema,
    oldNames: zod_1.z.array(zod_1.z.string()).default([]),
    firstName: zod_1.z.string().nullable().optional(),
    lastName: zod_1.z.string().nullable().optional(),
    email: zod_1.z.email(),
    password: zod_1.STRONG_PASSWORD_SCHEMA,
    bio: zod_1.z.string().nullable().optional(),
    image: zod_1.z.string().nullable().optional(),
    imageCustomId: zod_1.z.string().nullable().optional(),
    imageKey: zod_1.z.string().nullable().optional(),
    rememberMe: zod_1.z.boolean().default(false),
    isPrivate: zod_1.z.boolean().default(false),
    acceptedPolicies: zod_1.z.boolean().default(true),
    emailVerifiedAt: zod_1.z.date().nullable().optional(),
    emailVerificationToken: zod_1.z.uuidv4().nullable().optional(),
    emailVerificationTokenExpiresAt: zod_1.z.date().nullable().optional(),
    resetPasswordToken: zod_1.z.uuidv4().nullable().optional(),
    resetPasswordTokenExpiresAt: zod_1.z.date().nullable().optional(),
    refreshTokens: zod_1.z.array(zod_1.z.string()).default([]),
});
//# sourceMappingURL=select-user.dto.js.map
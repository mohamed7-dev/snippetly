import z from "zod";
import { baseModelSchema, objectIdSchema } from "../../../common/lib/zod";

export const SelectUserDto = baseModelSchema.extend({
  name: z.string().trim(),
  password: z.string().trim(),
  email: z.email().trim(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  acceptedPolicies: z.boolean(),
  emailVerifiedAt: z.date().nullable().optional(),
  refreshTokens: z.array(z.string()),
  emailVerificationToken: z.uuidv4().nullable().optional(),
  emailVerificationExpiresAt: z.date().nullable().optional(),
  // Relations (ObjectIds)
  folders: z.array(objectIdSchema).default([]),
  friendshipInbox: z.array(objectIdSchema).default([]),
  friendshipOutbox: z.array(objectIdSchema).default([]),
  friends: z.array(objectIdSchema).default([]),
});

export type SelectUserDtoType = z.infer<typeof SelectUserDto>;

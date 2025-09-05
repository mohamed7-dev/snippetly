import z from "zod";
import { baseModelSchema } from "../../../common/lib/zod";

export const SelectUserDto = baseModelSchema.extend({
  name: z.string().trim(),
  password: z.string().trim(),
  email: z.email().trim(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  emailVerifiedAt: z.date().nullable(),
  refreshTokens: z.array(z.string()),
  emailVerificationToken: z.date().nullable(),
  emailVerificationExpiresAt: z.date().nullable(),
  // Relations (ObjectIds)
  collections: z.array(z.string()),
  friendshipInbox: z.array(z.string()),
  friendshipOutbox: z.array(z.string()),
  friends: z.array(z.string()),
});

export type SelectUserDtoType = z.infer<typeof SelectUserDto>;

import { baseModelSchema, STRONG_PASSWORD_SCHEMA, z } from "../zod";

// Select User DTO
const nameSchema = z
  .string()
  .min(1, { message: "Name is required" })
  .regex(/^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/, {
    message:
      "Name can only contain letters, numbers, and use '-' or '_' as separators",
  });

export const SelectUserDto = baseModelSchema.extend({
  name: nameSchema,
  oldNames: z.array(z.string()).default([]),

  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.email(),
  password: STRONG_PASSWORD_SCHEMA,

  bio: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  imageCustomId: z.string().nullable().optional(),
  imageKey: z.string().nullable().optional(),

  rememberMe: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  acceptedPolicies: z.boolean().default(false),

  emailVerifiedAt: z.date().nullable().optional(),
  emailVerificationToken: z.uuidv4().nullable().optional(),
  emailVerificationTokenExpiresAt: z.date().nullable().optional(),

  resetPasswordToken: z.uuidv4().nullable().optional(),
  resetPasswordTokenExpiresAt: z.date().nullable().optional(),

  refreshTokens: z.array(z.string()).default([]),
});
export type SelectUserDtoType = z.infer<typeof SelectUserDto>;

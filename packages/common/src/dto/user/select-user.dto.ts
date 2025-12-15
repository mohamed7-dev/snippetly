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

  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  email: z.email(),
  password: STRONG_PASSWORD_SCHEMA,

  bio: z.string().nullish(),
  image: z.string().nullish(),
  imageKey: z.string().nullish(),

  rememberMe: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  acceptedPolicies: z.boolean().default(false),

  emailVerifiedAt: z.date().nullish(),
  emailVerificationToken: z.uuidv4().nullish(),
  emailVerificationTokenExpiresAt: z.date().nullish(),

  resetPasswordToken: z.uuidv4().nullish(),
  resetPasswordTokenExpiresAt: z.date().nullish(),

  refreshTokens: z.array(z.string()).default([]),
});
export type SelectUserDtoType = z.infer<typeof SelectUserDto>;

import z from "zod";

// Base Model
export const baseModelSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Password
const STRONG_PASSWORD_TITLE =
  "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";

export const STRONG_PASSWORD_SCHEMA = z
  .string()
  .min(12)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    { error: STRONG_PASSWORD_TITLE }
  );

export const LIMIT_SCHEMA = z
  .string()
  .transform((val) => Number(val))
  .refine((val) => val > 0 && val < 100)
  .optional();

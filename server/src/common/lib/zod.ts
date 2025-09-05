import z from "zod";

export const ObjectIdStringSchema = z
  .string()
  .trim()
  .regex(
    /^[a-fA-F0-9]{24}$/,
    "Invalid MongoDB ObjectId (must be 24 hex chars)"
  );

export const baseModelSchema = z.object({
  _id: ObjectIdStringSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

const STRONG_PASSWORD_TITLE =
  "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";

export const STRONG_PASSWORD_SCHEMA = z
  .string()
  .min(12)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    { error: STRONG_PASSWORD_TITLE }
  );

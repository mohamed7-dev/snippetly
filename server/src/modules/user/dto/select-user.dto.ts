import z from "zod";
import { createSelectSchema } from "drizzle-zod";
import { usersTable } from "../../../common/db/schema";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .regex(/^\S+$/, "Name must not contain spaces");

export const SelectUserDto = createSelectSchema(usersTable, {
  name: nameSchema,
  email: z.email(),
  emailVerificationToken: z.uuidv4().nullable(),
  resetPasswordToken: z.uuidv4().nullable(),
});

export type SelectUserDtoType = z.infer<typeof SelectUserDto>;

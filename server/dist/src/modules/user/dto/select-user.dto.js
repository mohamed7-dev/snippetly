import z from "zod";
import { createSelectSchema } from "drizzle-zod";
import { usersTable } from "../../../common/db/schema.js";
export const nameSchema = z.string().min(1, {
    message: "Name is required"
}).regex(/^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/, {
    message: "Name can only contain letters, numbers, and use '-' or '_' as separators"
});
export const SelectUserDto = createSelectSchema(usersTable, {
    name: nameSchema,
    email: z.email(),
    emailVerificationToken: z.uuidv4().nullable(),
    resetPasswordToken: z.uuidv4().nullable()
});

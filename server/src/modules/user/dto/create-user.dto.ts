import { z } from "zod";

export const CreateUserDto = z.object({
  firstName: z
    .string()
    .min(3, { error: "First name must be at least 3 characters long." }),
  lastName: z
    .string()
    .min(3, { error: "Last name must be at least 3 characters long." }),
  name: z
    .string()
    .min(3, { error: "name must be at least 3 characters long." }),
  password: z
    .string()
    .min(12, { error: "Password must be at least 12 characters long." }),
  email: z.email(),
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;

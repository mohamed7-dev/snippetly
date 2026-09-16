import z from 'zod';
import { idSchema } from './common-schemas.js';

export const authenticatedUser = z.object({
    id: idSchema,
    identifier: z.string().nonempty(),
});

export type AuthenticatedUser = z.infer<typeof authenticatedUser>;

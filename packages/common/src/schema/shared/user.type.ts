import z from 'zod';
import { node } from './common-schemas.js';
import { role } from './role.type.js';

export const authenticationMethod = node.extend({
    strategy: z.string().optional(),
});

export const user = node.extend({
    identifier: z.string().nonempty(),
    isVerified: z.boolean(),
    deletedAt: z.coerce.date().nullable(),
    lastAuthenticatedAt: z.coerce.date().nullable(),
    roles: z.array(role).nonempty(),
    authenticationMethods: z.array(authenticationMethod).nonempty(),
});

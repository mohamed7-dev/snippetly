import z from 'zod';
import { node } from './common-schemas.js';
import { role } from './role.type.js';

export const authenticationMethod = node.extend({
    strategy: z.string().nonempty(),
});

export const user = node.extend({
    identifier: z.string().nonempty(),
    isVerified: z.boolean(),
    deletedAt: z.date().nullable(),
    lastAuthenticatedAt: z.date().nullable(),
    roles: z.array(role).nonempty(),
    authenticationMethods: z.array(authenticationMethod).nonempty(),
});

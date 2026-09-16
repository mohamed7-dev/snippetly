import z from 'zod';
import { node } from './common-schemas.js';
import { user } from './user.type.js';

export const developer = node.extend({
    emailAddress: z.email().nonempty(),
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    bio: z.string().nullable(),
    image: z.string().nullable(),
    imageKey: z.string().nullable(),
    isPrivate: z.boolean(),
    deletedAt: z.date().nullable(),
    user: user,
});

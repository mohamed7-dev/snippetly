import z from 'zod';
import { node } from './common-schemas.js';
import { developer } from './developer.type.js';
import { tag } from './tag.type.js';

export const collection = node.extend({
    name: z.string().nonempty(),
    slug: z.string().nonempty(),
    color: z.string().nonempty(),
    description: z.string().nullable(),
    isPrivate: z.boolean(),
    allowForking: z.boolean(),
    creator: developer,
    tags: z.array(tag),
});

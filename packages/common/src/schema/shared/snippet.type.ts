import z from 'zod';
import { collection } from './collection.type.js';
import { node } from './common-schemas.js';
import { developer } from './developer.type.js';
import { tag } from './tag.type.js';

export const snippet = node.extend({
    name: z.string().nonempty(),
    slug: z.string().nonempty(),
    code: z.string().nonempty(),
    language: z.string().nonempty(),
    description: z.string().nullable(),
    note: z.string().nullable(),
    isPrivate: z.boolean(),
    allowForking: z.boolean(),
    deletedAt: z.date().nullable(),
    creator: developer,
    collection: collection,
    tags: z.array(tag),
});

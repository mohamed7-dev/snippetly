import z from 'zod';
import { node } from './common-schemas.js';
import { developer } from './developer.type.js';

export const tag = node.extend({
    value: z.string().nonempty(),
    usageCount: z.number().int(),
    addedBy: developer.nullable(),
});

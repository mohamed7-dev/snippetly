import z from 'zod';
import { createPaginatedListOutputSchema } from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import { tag } from '../shared/tag.type.js';

export const popularTagsInput = z
    .object({
        take: z.coerce.number().int(),
    })
    .partial();

const popularTagsItem = tag.omit({ addedBy: true }).extend({
    addedBy: developer
        .pick({
            id: true,
            firstName: true,
            lastName: true,
            image: true,
        })
        .nullish(),
});

export const popularTagsOutput = createPaginatedListOutputSchema(popularTagsItem);

export const popularTagsDto = {
    input: popularTagsInput,
    output: popularTagsOutput,
};

export interface PopularTagsDtoType {
    input: z.infer<typeof popularTagsInput>;
    output: z.infer<typeof popularTagsOutput>;
}

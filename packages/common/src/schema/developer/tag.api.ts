import z from 'zod';
import { createPaginatedListOutputSchema, InferDtoType } from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import { userInputErrorSchema, withServerErrors } from '../shared/errors.js';
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

export const popularTagsOutput = withServerErrors(createPaginatedListOutputSchema(popularTagsItem), [
    userInputErrorSchema,
]);

export const popularTagsDto = {
    input: popularTagsInput,
    output: popularTagsOutput,
};

export type PopularTagsDtoType = InferDtoType<typeof popularTagsDto>;

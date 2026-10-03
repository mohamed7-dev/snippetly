import z from 'zod';
import { InferDtoType } from '../shared/common-schemas.js';
import { forbiddenErrorSchema, userInputErrorSchema, withServerErrors } from '../shared/errors.js';

const generateSlugForEntityInput = z.object({
    entityName: z.string(),
    entityId: z.string().optional(),
    fieldName: z.string(),
    inputValue: z.string(),
});

const generateSlugForEntityOutput = withServerErrors(z.union([z.string()]), [
    userInputErrorSchema,
    forbiddenErrorSchema,
]);

export const generateSlugForEntityDto = {
    input: generateSlugForEntityInput,
    output: generateSlugForEntityOutput,
};

export type GenerateSlugForEntityDtoType = InferDtoType<typeof generateSlugForEntityDto>;

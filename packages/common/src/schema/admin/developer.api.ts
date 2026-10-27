import z from 'zod';
import { InferDtoType, passwordSchema } from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import {
    emailAddressConflictError,
    forbiddenErrorSchema,
    userInputErrorSchema,
    withServerErrors,
} from '../shared/errors.js';

const createDeveloperInput = developer
    .pick({ firstName: true, lastName: true, emailAddress: true })
    .required()
    .extend({ password: passwordSchema.optional() });

const createDeveloperOutput = withServerErrors(z.union([emailAddressConflictError, developer]), [
    userInputErrorSchema,
    forbiddenErrorSchema,
]);

export const createDeveloperDto = {
    input: createDeveloperInput,
    output: createDeveloperOutput,
};

export type CreateDeveloperDtoType = InferDtoType<typeof createDeveloperDto>;

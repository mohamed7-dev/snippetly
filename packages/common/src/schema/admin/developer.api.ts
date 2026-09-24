import z from 'zod';
import { developer } from '../shared/developer.type.js';
import { emailAddressConflictError } from '../shared/errors.js';

const createDeveloperInput = developer
    .pick({ firstName: true, lastName: true, emailAddress: true })
    .required();

const createDeveloperOutput = z.union([emailAddressConflictError, developer]);

export const createDeveloperDto = {
    input: createDeveloperInput,
    output: createDeveloperOutput,
};

export type CreateDeveloperDtoType = {
    input: z.infer<typeof createDeveloperInput>;
    output: z.infer<typeof createDeveloperOutput>;
};

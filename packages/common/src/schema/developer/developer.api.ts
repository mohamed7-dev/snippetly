import z from 'zod';
import {
    booleanFilterOperators,
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    deletionResponse,
    inputIdSchema,
    sortDirection,
    stringFilterOperators,
} from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';

//############################ Get Active Developer Account ############################

const activeDeveloperOutput = developer.nullable();

export const activeDeveloperDto = {
    input: z.null(),
    output: activeDeveloperOutput,
};

export type ActiveDeveloperDtoType = {
    input: null;
    output: z.infer<typeof activeDeveloperOutput>;
};

//############################ Update Developer Account ############################
const updateDeveloperAccountInput = developer
    .pick({
        firstName: true,
        lastName: true,
        bio: true,
        image: true,
        imageKey: true,
        isPrivate: true,
    })
    .partial();

const updateDeveloperAccountOutput = developer;

export const updateDeveloperAccountDto = {
    input: updateDeveloperAccountInput,
    output: updateDeveloperAccountOutput,
};

export type UpdateDeveloperAccountDtoType = {
    input: z.infer<typeof updateDeveloperAccountInput>;
    output: z.infer<typeof updateDeveloperAccountOutput>;
};

//############################ Delete Developer Account ############################

const deleteDeveloperAccountOutput = deletionResponse;

export const deleteDeveloperAccountDto = {
    input: z.null(),
    output: deleteDeveloperAccountOutput,
};

export type DeleteDeveloperAccountDtoType = {
    input: null;
    output: z.infer<typeof deleteDeveloperAccountOutput>;
};

//############################ FindOne ############################

const findOneDeveloperInput = inputIdSchema;

const developerItem = developer;

const publicDeveloperItem = developerItem.pick({
    id: true,
    firstName: true,
    lastName: true,
    bio: true,
    createdAt: true,
    image: true,
});

const privateDeveloperItem = developerItem;

const findOneDeveloperOutput = z.union([privateDeveloperItem, publicDeveloperItem]);

export const findOneDeveloperDto = {
    input: findOneDeveloperInput,
    output: findOneDeveloperOutput,
};

export type FindOneDeveloperDtoType = {
    input: z.infer<typeof findOneDeveloperInput>;
    output: z.infer<typeof findOneDeveloperOutput>;
};

//############################ List Developers ############################

const developerListInput = createPaginatedListInputSchema(
    z
        .object({
            firstName: stringFilterOperators,
            lastName: stringFilterOperators,
            emailAddress: stringFilterOperators,
            bio: stringFilterOperators,
            isPrivate: booleanFilterOperators,
            image: stringFilterOperators,
        })
        .partial(),
    z
        .object({
            firstName: sortDirection,
            lastName: sortDirection,
            emailAddress: sortDirection,
            bio: sortDirection,
            isPrivate: sortDirection,
            image: sortDirection,
        })
        .partial(),
)
    .unwrap()
    .partial();

const developerListItem = developer.pick({
    id: true,
    firstName: true,
    lastName: true,
    createdAt: true,
    image: true,
});

const developerListOutput = createPaginatedListOutputSchema(developerListItem);

export const developerListDto = {
    input: developerListInput,
    output: developerListOutput,
};

export type DeveloperListDtoType = {
    input: z.infer<typeof developerListInput>;
    output: z.infer<typeof developerListOutput>;
};

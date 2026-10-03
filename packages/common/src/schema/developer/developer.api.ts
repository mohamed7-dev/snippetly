import z from 'zod';
import {
    booleanFilterOperators,
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    deletionResponse,
    InferDtoType,
    inputIdSchema,
    sortDirection,
    stringFilterOperators,
} from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import {
    entityNotFoundErrorSchema,
    forbiddenErrorSchema,
    userInputErrorSchema,
    withServerErrors,
} from '../shared/errors.js';
import { friendshipStatusSchema } from '../shared/friendship.type.js';

//############################ Get Active Developer Account ############################

const activeDeveloperOutput = withServerErrors(developer.nullable(), [forbiddenErrorSchema]);

export const activeDeveloperDto = {
    input: z.null(),
    output: activeDeveloperOutput,
};

export type ActiveDeveloperDtoType = InferDtoType<typeof activeDeveloperDto>;

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

const updateDeveloperAccountOutput = withServerErrors(developer, [
    userInputErrorSchema,
    forbiddenErrorSchema,
]);

export const updateDeveloperAccountDto = {
    input: updateDeveloperAccountInput,
    output: updateDeveloperAccountOutput,
};

export type UpdateDeveloperAccountDtoType = InferDtoType<typeof updateDeveloperAccountDto>;

//############################ Delete Developer Account ############################

const deleteDeveloperAccountOutput = withServerErrors(deletionResponse, [forbiddenErrorSchema]);

export const deleteDeveloperAccountDto = {
    input: z.null(),
    output: deleteDeveloperAccountOutput,
};

export type DeleteDeveloperAccountDtoType = InferDtoType<typeof deleteDeveloperAccountDto>;

//############################ FindOne ############################

const findOneDeveloperInput = inputIdSchema;

const developerProfileInfo = z.object({
    friendCount: z.number().int().nonnegative(),
    friendshipInfo: z.object({
        isCurrentUserAFriend: z.boolean(),
        requestStatus: friendshipStatusSchema.nullable(),
    }),
    stats: z.object({
        snippetsCount: z.number().int().nonnegative(),
        collectionsCount: z.number().int().nonnegative(),
        friendsCount: z.number().int().nonnegative(),
        forkedSnippetsCount: z.number().int().nonnegative(),
        forkedCollectionsCount: z.number().int().nonnegative(),
    }),
});
const developerItem = developer.extend(developerProfileInfo.shape);

const publicDeveloperItem = developerItem.pick({
    id: true,
    firstName: true,
    lastName: true,
    bio: true,
    createdAt: true,
    image: true,
});

const privateDeveloperItem = developerItem;

const findOneDeveloperOutput = withServerErrors(z.union([privateDeveloperItem, publicDeveloperItem]), [
    userInputErrorSchema,
    entityNotFoundErrorSchema,
]);

export const findOneDeveloperDto = {
    input: findOneDeveloperInput,
    output: findOneDeveloperOutput,
};

export type FindOneDeveloperDtoType = InferDtoType<typeof findOneDeveloperDto>;

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

const developerListOutput = withServerErrors(createPaginatedListOutputSchema(developerListItem), [
    userInputErrorSchema,
]);

export const developerListDto = {
    input: developerListInput,
    output: developerListOutput,
};

export type DeveloperListDtoType = InferDtoType<typeof developerListDto>;

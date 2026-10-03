import z from 'zod';
import { collection } from '../shared/collection.type.js';
import {
    booleanFilterOperators,
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    dateTimeFilterOperators,
    deletionResponse,
    filterGroupOperator,
    idSchema,
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
import { tag } from '../shared/tag.type.js';

const collectionActionOutput = collection.omit({ creator: true, tags: true }).extend({
    creator: developer.pick({ id: true, firstName: true, lastName: true, image: true }),
    tags: z.array(tag.pick({ value: true })).optional(),
});

// ############################## Create #############################
const createCollectionInput = collection
    .pick({
        name: true,
        color: true,
        slug: true,
    })
    .extend(collection.pick({ isPrivate: true, allowForking: true, description: true }).partial().shape)
    .extend({
        tags: z.array(z.string().nonempty()).optional(),
    });

const createCollectionOutput = withServerErrors(collectionActionOutput, [
    userInputErrorSchema,
    forbiddenErrorSchema,
    entityNotFoundErrorSchema,
]);

export const createCollectionDto = {
    input: createCollectionInput,
    output: createCollectionOutput,
};

export type CreateCollectionDtoType = InferDtoType<typeof createCollectionDto>;

// ############################ Update ######################################
const updateCollectionInput = inputIdSchema.extend(createCollectionInput.partial().shape);

const updateCollectionOutput = withServerErrors(collectionActionOutput, [
    userInputErrorSchema,
    forbiddenErrorSchema,
    entityNotFoundErrorSchema,
]);

export const updateCollectionDto = {
    input: updateCollectionInput,
    output: updateCollectionOutput,
};

export type UpdateCollectionDtoType = InferDtoType<typeof updateCollectionDto>;

// ############################ Delete #######################################
const deleteCollectionInput = inputIdSchema;

const deleteCollectionOutput = withServerErrors(deletionResponse, [
    userInputErrorSchema,
    forbiddenErrorSchema,
    entityNotFoundErrorSchema,
]);

export const deleteCollectionDto = {
    input: deleteCollectionInput,
    output: deleteCollectionOutput,
};

export type DeleteCollectionDtoType = InferDtoType<typeof deleteCollectionDto>;

//########################### Fork ########################################
const forkCollectionInput = inputIdSchema;

const forkCollectionOutput = withServerErrors(collectionActionOutput, [
    userInputErrorSchema,
    forbiddenErrorSchema,
    entityNotFoundErrorSchema,
]);

export const forkCollectionDto = {
    input: forkCollectionInput,
    output: forkCollectionOutput,
};

export type ForkCollectionDtoType = InferDtoType<typeof forkCollectionDto>;

//########################### FindOne ########################################
const findOneCollectionInput = inputIdSchema;

const collectionItem = collection.omit({ creator: true, tags: true }).extend({
    creator: developer.pick({
        id: true,
        firstName: true,
        lastName: true,
        image: true,
    }),
    tags: z.array(tag.pick({ value: true })),
    snippetCount: z.number().int().nonnegative(),
});

const privateCollectionItem = collectionItem;

const publicCollectionItem = collectionItem.pick({
    id: true,
    createdAt: true,
    name: true,
    slug: true,
    color: true,
    description: true,
    allowForking: true,
    tags: true,
    creator: true,
    snippetCount: true,
});

const findOneCollectionOutput = withServerErrors(z.union([privateCollectionItem, publicCollectionItem]), [
    userInputErrorSchema,
    entityNotFoundErrorSchema,
]);

export const findOneCollectionDto = {
    input: findOneCollectionInput,
    output: findOneCollectionOutput,
};

export type FindOneCollectionDtoType = InferDtoType<typeof findOneCollectionDto>;

//########################### List ########################################
const filterSchema = z
    .object({
        name: stringFilterOperators,
        slug: stringFilterOperators,
        color: stringFilterOperators,
        description: stringFilterOperators,
        isPrivate: booleanFilterOperators,
        allowForking: booleanFilterOperators,
        deletedAt: dateTimeFilterOperators,
    })
    .partial();

const sortSchema = z
    .object({
        name: sortDirection,
        slug: sortDirection,
        color: sortDirection,
        description: sortDirection,
        isPrivate: sortDirection,
        allowForking: sortDirection,
        deletedAt: sortDirection,
    })
    .partial();

const tagsInListInput = z.object({
    values: z.array(z.string().nonempty()).optional(),
    operator: filterGroupOperator.optional(),
});

const collectionListInput = createPaginatedListInputSchema(filterSchema, sortSchema)
    .unwrap()
    .extend({
        tags: tagsInListInput,
        creator: idSchema.nonempty(),
    })
    .partial();

const collectionListItem = collection.omit({ tags: true, creator: true }).extend({
    tags: z.array(tag.pick({ value: true })).optional(),
    creator: developer.pick({
        id: true,
        firstName: true,
        lastName: true,
        image: true,
    }),
    snippetCount: z.number().int().nonnegative(),
    snippets: z.array(
        z.object({
            id: idSchema,
            name: z.string(),
            language: z.string(),
        }),
    ),
});

const privateCollectionListItem = collectionListItem;

const publicCollectionListItem = collectionListItem.pick({
    id: true,
    createdAt: true,
    name: true,
    slug: true,
    color: true,
    description: true,
    allowForking: true,
    tags: true,
    creator: true,
    snippetCount: true,
    snippets: true,
});

const collectionListOutput = withServerErrors(
    createPaginatedListOutputSchema(z.union([privateCollectionListItem, publicCollectionListItem])),
    [userInputErrorSchema],
);

export const collectionListDto = {
    input: collectionListInput,
    output: collectionListOutput,
};

export type CollectionListDtoType = InferDtoType<typeof collectionListDto>;

//########################### List Current User Collections ########################################
const currentUserCollectionListInput = collectionListInput.omit({ creator: true });

const currentUserCollectionListOutput = withServerErrors(
    createPaginatedListOutputSchema(collectionListItem),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const currentUserCollectionListDto = {
    input: currentUserCollectionListInput,
    output: currentUserCollectionListOutput,
};

export type CurrentUserCollectionListDtoType = InferDtoType<typeof currentUserCollectionListDto>;

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
import { snippet } from '../shared/snippet.type.js';
import { tag } from '../shared/tag.type.js';

const snippetActionOutput = snippet.omit({ creator: true, collection: true, tags: true }).extend({
    creator: developer.pick({ id: true, firstName: true, lastName: true, image: true }),
    tags: z.array(tag.pick({ value: true })).nullish(),
    collection: collection.pick({ id: true, name: true, slug: true, color: true }).nullish(),
});

// ############################## Create #############################
const createSnippetInput = snippet
    .pick({
        name: true,
        slug: true,
        code: true,
        language: true,
    })
    .extend(
        snippet.pick({ isPrivate: true, allowForking: true, description: true, note: true }).partial().shape,
    )
    .extend({
        collectionId: idSchema.optional(),
        tags: z.array(z.string().nonempty()).optional(),
    });

const createSnippetOutput = withServerErrors(snippetActionOutput, [
    userInputErrorSchema,
    forbiddenErrorSchema,
    entityNotFoundErrorSchema,
]);

export const createSnippetDto = {
    input: createSnippetInput,
    output: createSnippetOutput,
};

export type CreateSnippetDtoType = InferDtoType<typeof createSnippetDto>;

// ############################ Update ######################################
const updateSnippetInput = inputIdSchema.extend(createSnippetInput.partial().shape);

const updateSnippetOutput = withServerErrors(snippetActionOutput, [
    userInputErrorSchema,
    forbiddenErrorSchema,
    entityNotFoundErrorSchema,
]);

export const updateSnippetDto = {
    input: updateSnippetInput,
    output: updateSnippetOutput,
};

export type UpdateSnippetDtoType = InferDtoType<typeof updateSnippetDto>;

// ############################ Delete #######################################
const deleteSnippetInput = inputIdSchema;

const deleteSnippetOutput = withServerErrors(deletionResponse, [
    userInputErrorSchema,
    forbiddenErrorSchema,
    entityNotFoundErrorSchema,
]);

export const deleteSnippetDto = {
    input: deleteSnippetInput,
    output: deleteSnippetOutput,
};

export type DeleteSnippetDtoType = InferDtoType<typeof deleteSnippetDto>;

//########################### Fork ########################################
const forkSnippetInput = inputIdSchema.extend({
    collectionId: idSchema.optional(),
});

const forkSnippetOutput = withServerErrors(snippetActionOutput, [
    userInputErrorSchema,
    forbiddenErrorSchema,
    entityNotFoundErrorSchema,
]);

export const forkSnippetDto = {
    input: forkSnippetInput,
    output: forkSnippetOutput,
};

export type ForkSnippetDtoType = InferDtoType<typeof forkSnippetDto>;

//########################### FindOne ########################################
const findOneSnippetInput = inputIdSchema;

const snippetItem = snippet.omit({ collection: true, tags: true, creator: true }).extend({
    creator: developer.pick({
        id: true,
        firstName: true,
        lastName: true,
        image: true,
    }),
    tags: z.array(tag.pick({ value: true })),
    collection: collection
        .pick({
            id: true,
            name: true,
            slug: true,
            color: true,
        })
        .nullish(),
});

const publicSnippetItem = snippetItem.pick({
    id: true,
    name: true,
    slug: true,
    language: true,
    code: true,
    description: true,
    note: true,
    allowForking: true,
    tags: true,
    collection: true,
    creator: true,
});

const privateSnippetItem = snippetItem;

const findOneSnippetOutput = withServerErrors(z.union([privateSnippetItem, publicSnippetItem]), [
    userInputErrorSchema,
    entityNotFoundErrorSchema,
]);

export const findOneSnippetDto = {
    input: findOneSnippetInput,
    output: findOneSnippetOutput,
};

export type FindOneSnippetDtoType = InferDtoType<typeof findOneSnippetDto>;

//########################### List ########################################
const filterSchema = z
    .object({
        name: stringFilterOperators,
        slug: stringFilterOperators,
        code: stringFilterOperators,
        language: stringFilterOperators,
        description: stringFilterOperators,
        note: stringFilterOperators,
        isPrivate: booleanFilterOperators,
        allowForking: booleanFilterOperators,
        deletedAt: dateTimeFilterOperators,
    })
    .partial();

const sortSchema = z
    .object({
        name: sortDirection,
        slug: sortDirection,
        code: sortDirection,
        language: sortDirection,
        description: sortDirection,
        note: sortDirection,
        isPrivate: sortDirection,
        allowForking: sortDirection,
        deletedAt: sortDirection,
    })
    .partial();

const tagsInListInput = z.object({
    values: z.array(z.string().nonempty()).optional(),
    operator: filterGroupOperator.optional(),
});

const snippetListInput = createPaginatedListInputSchema(filterSchema, sortSchema)
    .unwrap()
    .extend({
        discover: z
            .union([
                z.boolean(),
                z.literal('true').transform(() => true),
                z.literal('false').transform(() => false),
            ])
            .optional(),
        tags: tagsInListInput,
        collection: idSchema.nonempty(),
        creator: idSchema.nonempty(),
    })
    .partial();

const snippetListItem = snippet.omit({ collection: true, tags: true, creator: true }).extend({
    creator: developer.pick({
        id: true,
        firstName: true,
        lastName: true,
        image: true,
    }),
    tags: z.array(tag.pick({ value: true })),
    collection: collection
        .pick({
            id: true,
            name: true,
            slug: true,
            color: true,
        })
        .nullish(),
});

const publicListSnippetItem = snippetListItem.pick({
    id: true,
    name: true,
    slug: true,
    language: true,
    code: true,
    description: true,
    note: true,
    allowForking: true,
    tags: true,
    collection: true,
    creator: true,
});

const privateListSnippetItem = snippetListItem;

const snippetListOutput = withServerErrors(
    createPaginatedListOutputSchema(z.union([privateListSnippetItem, publicListSnippetItem])),
    [userInputErrorSchema],
);

export const snippetListDto = {
    input: snippetListInput,
    output: snippetListOutput,
};

export type SnippetListDtoType = InferDtoType<typeof snippetListDto>;

//########################### List Current User Snippets ########################################
const currentUserSnippetListInput = snippetListInput.omit({ creator: true });

const currentUserSnippetListOutput = withServerErrors(createPaginatedListOutputSchema(snippetListItem), [
    userInputErrorSchema,
    forbiddenErrorSchema,
]);

export const currentUserSnippetListDto = {
    input: currentUserSnippetListInput,
    output: currentUserSnippetListOutput,
};

export type CurrentUserSnippetListDtoType = InferDtoType<typeof currentUserSnippetListDto>;

//########################### List User Friends Snippets ########################################
const userFriendsSnippetsListItem = snippetListItem.pick({
    id: true,
    name: true,
    slug: true,
    language: true,
    code: true,
    description: true,
    note: true,
    allowForking: true,
    tags: true,
    collection: true,
    creator: true,
});

const userFriendsSnippetsListInput = snippetListInput.omit({ discover: true });

const userFriendsSnippetsItem = userFriendsSnippetsListItem;

const userFriendsSnippetsListOutput = withServerErrors(
    createPaginatedListOutputSchema(userFriendsSnippetsItem),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const userFriendsSnippetsListDto = {
    input: userFriendsSnippetsListInput,
    output: userFriendsSnippetsListOutput,
};

export type UserFriendsSnippetsListDtoType = InferDtoType<typeof userFriendsSnippetsListDto>;

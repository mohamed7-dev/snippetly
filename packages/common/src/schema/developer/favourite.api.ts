import z from 'zod';
import { collection } from '../shared/collection.type.js';
import {
    booleanFilterOperators,
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    dateTimeFilterOperators,
    filterGroupOperator,
    idSchema,
    InferDtoType,
    sortDirection,
    stringFilterOperators,
    successResponse,
} from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import { entityNotFoundErrorSchema, forbiddenErrorSchema, withServerErrors } from '../shared/errors.js';
import { snippet } from '../shared/snippet.type.js';
import { tag } from '../shared/tag.type.js';

const targetDeveloper = developer.pick({
    id: true,
    firstName: true,
    lastName: true,
    image: true,
    isVerified: true,
});

const tagsInListInput = z.object({
    values: z.array(z.string().nonempty()).optional(),
    operator: filterGroupOperator.optional(),
});

const favouriteActionInput = z.object({
    id: idSchema,
    resourceType: z.enum(['snippets', 'collections', 'developers']),
});

const favouriteActionOutput = withServerErrors(successResponse, [
    entityNotFoundErrorSchema,
    forbiddenErrorSchema,
]);

//################################## Add ###############################

export const addFavouriteDto = {
    input: favouriteActionInput,
    output: favouriteActionOutput,
};

export type AddFavouriteDtoType = InferDtoType<typeof addFavouriteDto>;

//################################## Remove ###############################

export const removeFavouriteDto = {
    input: favouriteActionInput,
    output: favouriteActionOutput,
};

export type RemoveFavouriteDtoType = InferDtoType<typeof removeFavouriteDto>;

//################################## List Snippets ###############################
const favouriteSnippetFilter = z
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
        creatorFirstName: stringFilterOperators,
        creatorLastName: stringFilterOperators,
    })
    .partial();

const favouriteSnippetSort = z
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
        creatorFirstName: sortDirection,
        creatorLastName: sortDirection,
    })
    .partial();
const favouriteSnippetsListInput = createPaginatedListInputSchema(
    favouriteSnippetFilter,
    favouriteSnippetSort,
)
    .unwrap()
    .extend({ tags: tagsInListInput })
    .partial();

const favouriteSnippet = snippet
    .pick({
        id: true,
        createdAt: true,
        name: true,
        slug: true,
        language: true,
        description: true,
        creator: true,
    })
    .extend({
        creator: targetDeveloper,
    });

const favouriteSnippetListItem = favouriteSnippet.extend({
    tags: z.array(tag.pick({ value: true })),
});

export const favouriteSnippetsListDto = {
    input: favouriteSnippetsListInput,
    output: withServerErrors(createPaginatedListOutputSchema(favouriteSnippetListItem), [
        forbiddenErrorSchema,
    ]),
};

export type FavouriteSnippetsListDtoType = InferDtoType<typeof favouriteSnippetsListDto>;

//################################## List Collections ###############################

const favouriteCollectionFilter = z
    .object({
        name: stringFilterOperators,
        slug: stringFilterOperators,
        color: stringFilterOperators,
        description: stringFilterOperators,
        isPrivate: booleanFilterOperators,
        allowForking: booleanFilterOperators,
        deletedAt: dateTimeFilterOperators,
        creatorFirstName: stringFilterOperators,
        creatorLastName: stringFilterOperators,
    })
    .partial();

const favouriteCollectionSort = z
    .object({
        name: sortDirection,
        slug: sortDirection,
        color: sortDirection,
        description: sortDirection,
        isPrivate: sortDirection,
        allowForking: sortDirection,
        deletedAt: sortDirection,
        creatorFirstName: sortDirection,
        creatorLastName: sortDirection,
    })
    .partial();

const favouriteCollectionsListInput = createPaginatedListInputSchema(
    favouriteCollectionFilter,
    favouriteCollectionSort,
)
    .unwrap()
    .extend({ tags: tagsInListInput })
    .partial();

const favouriteCollection = collection
    .pick({
        id: true,
        createdAt: true,
        name: true,
        slug: true,
        color: true,
        description: true,
        creator: true,
    })
    .extend({
        creator: targetDeveloper,
    });

const favouriteCollectionListItem = favouriteCollection.extend({
    tags: z.array(tag.pick({ value: true })),
});

export const favouriteCollectionsListDto = {
    input: favouriteCollectionsListInput,
    output: withServerErrors(createPaginatedListOutputSchema(favouriteCollectionListItem), [
        forbiddenErrorSchema,
    ]),
};

export type FavouriteCollectionsListDtoType = InferDtoType<typeof favouriteCollectionsListDto>;

//################################## List Developers ###############################
const favouriteDeveloper = developer.pick({
    id: true,
    createdAt: true,
    firstName: true,
    lastName: true,
    image: true,
    bio: true,
    isVerified: true,
});

export const favouriteDevelopersListDto = {
    input: createPaginatedListInputSchema(
        z
            .object({
                firstName: stringFilterOperators,
                lastName: stringFilterOperators,
                bio: stringFilterOperators,
            })
            .partial(),
        z
            .object({
                firstName: sortDirection,
                lastName: sortDirection,
                bio: sortDirection,
            })
            .partial(),
    )
        .unwrap()
        .partial(),
    output: withServerErrors(createPaginatedListOutputSchema(favouriteDeveloper), [forbiddenErrorSchema]),
};

export type FavouriteDevelopersListDtoType = InferDtoType<typeof favouriteDevelopersListDto>;

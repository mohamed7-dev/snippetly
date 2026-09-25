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
    inputIdSchema,
    sortDirection,
    stringFilterOperators,
} from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import { tag } from '../shared/tag.type.js';

const collectionActionOutput = collection.omit({ creator: true, tags: true }).extend({
    creator: developer.pick({ id: true, firstName: true, lastName: true, image: true }),
    tags: z.array(tag.pick({ value: true })).optional(),
});

// ############################## Create #############################
const createCollectionInput = collection
    .pick({
        name: true,
        slug: true,
        color: true,
    })
    .extend(collection.pick({ isPrivate: true, allowForking: true, description: true }).partial().shape)
    .extend({
        tags: z.array(z.string().nonempty()).optional(),
    });

const createCollectionOutput = collectionActionOutput;

export const createCollectionDto = {
    input: createCollectionInput,
    output: createCollectionOutput,
};

export interface CreateCollectionDtoType {
    input: z.infer<typeof createCollectionInput>;
    output: z.infer<typeof createCollectionOutput>;
}

// ############################ Update ######################################
const updateCollectionInput = inputIdSchema.extend(createCollectionInput.partial().shape);

const updateCollectionOutput = collectionActionOutput;

export const updateCollectionDto = {
    input: updateCollectionInput,
    output: updateCollectionOutput,
};

export interface UpdateCollectionDtoType {
    input: z.infer<typeof updateCollectionInput>;
    output: z.infer<typeof updateCollectionOutput>;
}

// ############################ Delete #######################################
const deleteCollectionInput = inputIdSchema;

const deleteCollectionOutput = deletionResponse;

export const deleteCollectionDto = {
    input: deleteCollectionInput,
    output: deleteCollectionOutput,
};

export interface DeleteCollectionDtoType {
    input: z.infer<typeof deleteCollectionInput>;
    output: z.infer<typeof deleteCollectionOutput>;
}

//########################### Fork ########################################
const forkCollectionInput = inputIdSchema;

const forkCollectionOutput = collectionActionOutput;

export const forkCollectionDto = {
    input: forkCollectionInput,
    output: forkCollectionOutput,
};

export interface ForkCollectionDtoType {
    input: z.infer<typeof forkCollectionInput>;
    output: z.infer<typeof forkCollectionOutput>;
}

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
});

const findOneCollectionOutput = z.union([privateCollectionItem, publicCollectionItem]);

export const findOneCollectionDto = {
    input: findOneCollectionInput,
    output: findOneCollectionOutput,
};

export interface FindOneCollectionDtoType {
    input: z.infer<typeof findOneCollectionInput>;
    output: z.infer<typeof findOneCollectionOutput>;
}

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
});

const collectionListOutput = createPaginatedListOutputSchema(
    z.union([privateCollectionListItem, publicCollectionListItem]),
);

export const collectionListDto = {
    input: collectionListInput,
    output: collectionListOutput,
};

export interface CollectionListDtoType {
    input: z.infer<typeof collectionListInput>;
    output: z.infer<typeof collectionListOutput>;
}

//########################### List Current User Collections ########################################
const currentUserCollectionListInput = collectionListInput.omit({ creator: true });

const currentUserCollectionListOutput = createPaginatedListOutputSchema(collectionListItem);

export const currentUserCollectionListDto = {
    input: currentUserCollectionListInput,
    output: currentUserCollectionListOutput,
};

export interface CurrentUserCollectionListDtoType {
    input: z.infer<typeof currentUserCollectionListInput>;
    output: z.infer<typeof currentUserCollectionListOutput>;
}

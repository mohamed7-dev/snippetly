import z from 'zod';
import { collection } from '../shared/collection.type.js';
import {
    booleanFilterOperators,
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    deletionResponse,
    idSchema,
    inputIdSchema,
    sortDirection,
    stringFilterOperators,
} from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import { snippet } from '../shared/snippet.type.js';
import { tag } from '../shared/tag.type.js';

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
        collectionId: idSchema,
        tags: z.array(z.string().nonempty()).optional(),
    });

const createSnippetOutput = snippet;

export const createSnippetDto = {
    input: createSnippetInput,
    output: createSnippetOutput,
};

export interface CreateSnippetDtoType {
    input: z.infer<typeof createSnippetInput>;
    output: z.infer<typeof createSnippetOutput>;
}

// ############################ Update ######################################
const updateSnippetInput = inputIdSchema.extend(createSnippetInput.partial().shape);

const updateSnippetOutput = snippet;

export const updateSnippetDto = {
    input: updateSnippetInput,
    output: updateSnippetOutput,
};

export interface UpdateSnippetDtoType {
    input: z.infer<typeof updateSnippetInput>;
    output: z.infer<typeof updateSnippetOutput>;
}

// ############################ Delete #######################################
const deleteSnippetInput = inputIdSchema;

const deleteSnippetOutput = deletionResponse;

export const deleteSnippetDto = {
    input: deleteSnippetInput,
    output: deleteSnippetOutput,
};

export interface DeleteSnippetDtoType {
    input: z.infer<typeof deleteSnippetInput>;
    output: z.infer<typeof deleteSnippetOutput>;
}

//########################### Fork ########################################
const forkSnippetInput = inputIdSchema;

const forkSnippetOutput = snippet;

export const forkSnippetDto = {
    input: forkSnippetInput,
    output: forkSnippetOutput,
};

export interface ForkSnippetDtoType {
    input: z.infer<typeof forkSnippetInput>;
    output: z.infer<typeof forkSnippetOutput>;
}

//########################### FindOne ########################################
const findOneSnippetInput = inputIdSchema;

const snippetItem = snippet.omit({ collection: true, tags: true, creator: true }).extend({
    creator: developer.pick({
        id: true,
        firstName: true,
        lastName: true,
        emailAddress: true,
        image: true,
    }),
    tags: z.array(tag.pick({ value: true })),
    collection: collection.pick({
        id: true,
        name: true,
        slug: true,
        color: true,
    }),
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

const findOneSnippetOutput = z.union([privateSnippetItem, publicSnippetItem]);

export const findOneSnippetDto = {
    input: findOneSnippetInput,
    output: findOneSnippetOutput,
};

export interface FindOneSnippetDtoType {
    input: z.infer<typeof findOneSnippetInput>;
    output: z.infer<typeof findOneSnippetOutput>;
}

//########################### List ########################################
const snippetListInput = createPaginatedListInputSchema(
    z
        .object({
            name: stringFilterOperators,
            slug: stringFilterOperators,
            code: stringFilterOperators,
            language: stringFilterOperators,
            description: stringFilterOperators,
            note: stringFilterOperators,
            isPrivate: booleanFilterOperators,
            allowForking: booleanFilterOperators,
        })
        .partial(),
    z
        .object({
            name: sortDirection,
            slug: sortDirection,
            code: sortDirection,
            language: sortDirection,
            description: sortDirection,
            note: sortDirection,
            isPrivate: sortDirection,
            allowForking: sortDirection,
        })
        .partial(),
)
    .unwrap()
    .extend({
        tags: z.array(z.string().nonempty()).optional(),
        collection: idSchema.nonempty(),
        creator: idSchema.nonempty(),
    })
    .partial();

const snippetListItem = snippet.omit({ collection: true, tags: true, creator: true }).extend({
    creator: developer.pick({
        id: true,
        firstName: true,
        lastName: true,
        emailAddress: true,
        image: true,
    }),
    tags: z.array(tag.pick({ value: true })),
    collection: collection.pick({
        id: true,
        name: true,
        slug: true,
        color: true,
    }),
});

const publicListSnippetItem = snippetItem.pick({
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

const snippetListOutput = createPaginatedListOutputSchema(
    z.union([privateListSnippetItem, publicListSnippetItem]),
);

export const snippetListDto = {
    input: snippetListInput,
    output: snippetListOutput,
};

export interface SnippetListDtoType {
    input: z.infer<typeof snippetListInput>;
    output: z.infer<typeof snippetListOutput>;
}

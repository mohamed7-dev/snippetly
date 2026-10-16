import z from 'zod';
import { collection } from '../shared/collection.type.js';
import { InferDtoType, filterGroupOperator } from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import { snippet } from '../shared/snippet.type.js';
import { tag } from '../shared/tag.type.js';

const searchInput = z.object({
    term: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .optional()
        .describe('Search text used to rank snippets, collections, developers, and related tags.'),
    tags: z
        .object({
            values: z.array(z.string().trim().min(1)).optional(),
            operator: filterGroupOperator.optional(),
        })
        .optional()
        .describe(
            'Require the matching resources to have the selected tags (AND by default; OR is supported).',
        ),
    take: z.coerce.number().int().min(1).max(100).default(25).describe('Maximum results per result group.'),
    skip: z.coerce
        .number()
        .int()
        .min(0)
        .default(0)
        .describe('Number of results to skip in each result group.'),
});

const searchSnippet = snippet
    .pick({
        id: true,
        createdAt: true,
        name: true,
        slug: true,
        language: true,
        description: true,
    })
    .extend({
        creator: developer.pick({ id: true, firstName: true, lastName: true, image: true }),
        collection: collection.pick({ id: true, name: true, slug: true, color: true }).nullable(),
        tags: z.array(tag.pick({ value: true })),
        score: z.number(),
    });

const searchCollection = collection
    .pick({ id: true, createdAt: true, name: true, slug: true, color: true, description: true })
    .extend({
        creator: developer.pick({ id: true, firstName: true, lastName: true, image: true }),
        tags: z.array(tag.pick({ value: true })),
        score: z.number(),
    });

const searchDeveloper = developer
    .pick({ id: true, createdAt: true, firstName: true, lastName: true, bio: true, image: true })
    .extend({ score: z.number() });

const searchGroup = <T extends z.ZodType>(item: T) =>
    z.object({
        items: z.array(item),
        totalItems: z.number().int().nonnegative(),
    });

const searchOutput = z.object({
    snippets: searchGroup(searchSnippet),
    collections: searchGroup(searchCollection),
    developers: searchGroup(searchDeveloper),
    tagCounts: z.array(
        z.object({
            value: z.string(),
            count: z.number().int().nonnegative(),
        }),
    ),
});

export const searchDto = {
    input: searchInput,
    output: searchOutput,
};

export type SearchDtoType = InferDtoType<typeof searchDto>;

import { SearchResultsPage } from '@/features/search/components/search-results-page';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

const resultType = z.enum(['snippets', 'collections', 'developers']);
const searchSchema = z
    .object({
        term: z.string().trim().max(200).optional(),
        tags: z.array(z.string().trim().min(1)).optional(),
        types: z.array(resultType).optional(),
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(public)/search/')({
    component: SearchPage,
    validateSearch: searchSchema,
    head: () => ({
        meta: [{ title: 'Search' }],
    }),
});

function SearchPage() {
    const { term, tags, types } = Route.useSearch() ?? {};

    return <SearchResultsPage term={term} tags={tags} types={types} />;
}

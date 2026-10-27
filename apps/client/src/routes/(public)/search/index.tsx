import { Page, PageDescription, PageTitle } from '@/components/layout/page';
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

    return (
        <main>
            <Page className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
                <PageTitle>Search results</PageTitle>
                <PageDescription>
                    {term ? `Results for “${term}”` : 'Results matching your tags'}
                    {!!tags?.length && ` · ${tags?.map(tag => `#${tag}`).join(' ')}`}
                </PageDescription>
                <SearchResultsPage term={term} tags={tags} types={types} />
            </Page>
        </main>
    );
}

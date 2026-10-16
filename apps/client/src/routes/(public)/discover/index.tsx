import { DiscoverPageMainContentHeader } from '@/features/discover/components/sections/discover-page-main-content-header';
import { DiscoverPageTabs } from '@/features/discover/components/sections/discover-page-tabs';
import { discoverDevelopersQueryOptions } from '@/features/discover/lib/discover-query-options';
import { collectionListDto, developerListDto, snippetListDto } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

const searchSchema = z
    .object({
        tab: z.enum(['developers', 'snippets', 'collections']).default('developers').catch('developers'),
        developers: z.object({
            sort: developerListDto.input.shape.sort,
            filter: developerListDto.input.shape.filter,
            filterOperator: developerListDto.input.shape.filterOperator,
        }),
        snippets: z.object({
            sort: snippetListDto.input.shape.sort,
            filter: snippetListDto.input.shape.filter,
            filterOperator: snippetListDto.input.shape.filterOperator,
            tags: snippetListDto.input.shape.tags,
        }),
        collections: z.object({
            sort: collectionListDto.input.shape.sort,
            filter: collectionListDto.input.shape.filter,
            filterOperator: collectionListDto.input.shape.filterOperator,
            tags: collectionListDto.input.shape.tags,
        }),
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(public)/discover/')({
    component: DiscoverPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Discover',
                },
            ],
        };
    },
    validateSearch: searchSchema,
    loaderDeps: ({ search: { developers } = {} }) => ({ ...developers }),
    loader: ({ context: { queryClient }, deps }) => {
        queryClient.infiniteQuery(discoverDevelopersQueryOptions(deps, Object.values(deps))).catch();
    },
});

function DiscoverPage() {
    return (
        <main className="container mx-auto flex flex-col gap-6 px-6 py-8">
            <DiscoverPageMainContentHeader />
            <DiscoverPageTabs />
        </main>
    );
}

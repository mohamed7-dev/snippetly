import { TrashPageContentHeader } from '@/features/trash/components/sections/trash-page-content-header';
import { TrashPageContentTabs } from '@/features/trash/components/sections/trash-page-content-tabs';
import { listTrashedSnippetsQueryOptions } from '@/features/trash/lib/trash-query-options';
import { currentUserTrashedCollectionListDto, currentUserTrashedSnippetListDto } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

const searchSchema = z
    .object({
        tab: z.enum(['snippets', 'collections']).default('snippets').catch('snippets'),
        snippets: z
            .object({
                sort: currentUserTrashedSnippetListDto.input.shape.sort,
                filter: currentUserTrashedSnippetListDto.input.shape.filter,
                filterOperator: currentUserTrashedSnippetListDto.input.shape.filterOperator,
                tags: currentUserTrashedSnippetListDto.input.shape.tags,
            })
            .partial(),
        collections: z
            .object({
                sort: currentUserTrashedCollectionListDto.input.shape.sort,
                filter: currentUserTrashedCollectionListDto.input.shape.filter,
                filterOperator: currentUserTrashedCollectionListDto.input.shape.filterOperator,
                tags: currentUserTrashedCollectionListDto.input.shape.tags,
            })
            .partial(),
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/_boundary/trash/')({
    component: TrashPage,
    validateSearch: searchSchema,
    head: () => ({
        meta: [{ title: 'Trash' }],
    }),
    loaderDeps: ({ search: { snippets } = {} }) => ({ ...snippets }),
    loader: ({ context: { queryClient }, deps }) => {
        queryClient.infiniteQuery(listTrashedSnippetsQueryOptions(deps, Object.values(deps))).catch();
    },
});

function TrashPage() {
    return (
        <div className="space-y-8">
            <TrashPageContentHeader />
            <TrashPageContentTabs />
        </div>
    );
}

import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { queryClient } from '@/components/providers/tanstack-query-provider';
import { CollectionPageHeader } from '@/features/collections/components/sections/collection-page-header';
import { CollectionPageMainContent } from '@/features/collections/components/sections/collection-page-main-content';
import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { CollectionPageSnippetsList } from '@/features/snippet-listing/components/sections/collection-page-snippets-list';
import { listCollectionSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { snippetListDto } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import z from 'zod';

const searchSchema = z.object({
    sort: snippetListDto.input.shape.sort.default({}).catch({}),
    filter: snippetListDto.input.shape.filter.default({}).catch({}),
    filterOperator: snippetListDto.input.shape.filterOperator,
});

export const Route = createFileRoute('/(protected)/dashboard/collections/$id/')({
    component: CollectionPage,
    validateSearch: searchSchema,
    head: async ({ params }) => {
        const data = await queryClient.query({
            ...getCollectionQueryOptions(params.id),
        });
        return {
            meta: [
                {
                    name: 'description',
                    content: data.description ?? `Collection of snippets related to ${data.name}`,
                },
                {
                    title: data.name,
                },
            ],
        };
    },
    loaderDeps: ({ search: { sort, filter } }) => ({ sort, filter }),
    loader: async ({ context: { queryClient }, params: { id }, deps }) => {
        await queryClient.infiniteQuery({
            ...listCollectionSnippetsQueryOptions(id, deps, Object.values(deps)),
            staleTime: 'static',
        });
    },
});

function CollectionPage() {
    return (
        <React.Fragment>
            <CollectionPageHeader />
            <main className="container mx-auto px-6 py-8 max-w-6xl">
                <CollectionPageMainContent />
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <CollectionPageSnippetsList />
                    </React.Suspense>
                </ErrorBoundary>
            </main>
        </React.Fragment>
    );
}

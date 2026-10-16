import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { queryClient } from '@/components/providers/tanstack-query-provider';
import { CollectionPageMainContent } from '@/features/collections/components/sections/collection-page-main-content';
import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { CollectionPageSnippetsList } from '@/features/snippet-listing/components/sections/collection-page-snippets-list';
import { listCollectionSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { snippetListDto } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import z from 'zod';

const searchSchema = z
    .object({
        sort: snippetListDto.input.shape.sort,
        filter: snippetListDto.input.shape.filter,
        filterOperator: snippetListDto.input.shape.filterOperator,
        tags: snippetListDto.input.shape.tags,
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(public)/collections/$id')({
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
    loaderDeps: ({ search: { sort, filter, filterOperator } = {} }) => ({ sort, filter, filterOperator }),
    loader: async ({ context: { queryClient }, params: { id }, deps }) => {
        await queryClient.query({ ...getCollectionQueryOptions(id), staleTime: 'static' });
        queryClient
            .infiniteQuery({
                ...listCollectionSnippetsQueryOptions(id, deps, Object.values(deps)),
            })
            .catch();
    },
});

function CollectionPage() {
    return (
        <main className="container mx-auto px-6 py-8 max-w-6xl">
            <CollectionPageMainContent />
            <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                <React.Suspense fallback={<SectionLoader />}>
                    <CollectionPageSnippetsList />
                </React.Suspense>
            </ErrorBoundary>
        </main>
    );
}

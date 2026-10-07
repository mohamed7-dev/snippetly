import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { queryClient } from '@/components/providers/tanstack-query-provider';
import { CollectionPageHeader } from '@/features/collections/components/sections/collection-page-header';
import { CollectionPageMainContent } from '@/features/collections/components/sections/collection-page-main-content';
import { CollectionPageSnippetsList } from '@/features/collections/components/sections/collection-page-snippets-list';
import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { listCollectionSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/(protected)/dashboard/collections/$id/')({
    component: CollectionPage,
    head: async ({ params }) => {
        const data = await queryClient.query({
            ...getCollectionQueryOptions(params.id),
            staleTime: 'static',
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
    loader: ({ context: { queryClient }, params: { id } }) => {
        queryClient.infiniteQuery({ ...listCollectionSnippetsQueryOptions(id) }).catch();
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

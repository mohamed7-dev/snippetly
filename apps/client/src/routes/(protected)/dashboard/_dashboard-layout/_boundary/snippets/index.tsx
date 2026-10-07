import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { SnippetsPageContentHeader } from '@/features/snippet-listing/components/sections/snippets-page-content-header';
import { SnippetsPageMainContent } from '@/features/snippet-listing/components/sections/snippets-page-main-content';
import { SnippetsPageStats } from '@/features/snippet-listing/components/sections/snippets-page-stats';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/_boundary/snippets/')({
    component: RouteComponent,
    head: () => {
        return {
            meta: [
                {
                    title: 'All Snippets',
                },
            ],
        };
    },
    loader: async ({ context: { queryClient } }) => {
        await queryClient.infiniteQuery({ ...listCurrentUserSnippetsQueryOptions(), staleTime: 'static' });
    },
});

function RouteComponent() {
    return (
        <div className="p-0 lg:p-6">
            <SnippetsPageContentHeader />
            <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                <React.Suspense fallback={<SectionLoader />}>
                    <SnippetsPageStats />
                </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                <React.Suspense fallback={<SectionLoader />}>
                    <SnippetsPageMainContent />
                </React.Suspense>
            </ErrorBoundary>
        </div>
    );
}

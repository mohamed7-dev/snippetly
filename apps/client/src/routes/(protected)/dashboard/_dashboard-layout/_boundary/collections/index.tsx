import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { CollectionsPageMainContent } from '@/features/collection-listing/components/sections/collections-page-main-content';
import { CollectionsPageMainContentHeader } from '@/features/collection-listing/components/sections/collections-page-main-content-header';
import { CollectionsPageStats } from '@/features/collection-listing/components/sections/collections-page-stats';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/_boundary/collections/')({
    component: CollectionsPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'All Collections',
                },
            ],
        };
    },
    loader: async ({ context: { queryClient } }) => {
        await queryClient.infiniteQuery({ ...listCurrentUserCollectionsQueryOptions(), staleTime: 'static' });
    },
});

function CollectionsPage() {
    return (
        <div className="p-0 lg:p-6">
            <CollectionsPageMainContentHeader />
            <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                <React.Suspense fallback={<SectionLoader />}>
                    <CollectionsPageStats />
                    <CollectionsPageMainContent />
                </React.Suspense>
            </ErrorBoundary>
        </div>
    );
}

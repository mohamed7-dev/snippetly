import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { InsightsPageMainContentHeader } from '@/features/insights/components/sections/insights-page-main-content-header';
import { InsightsPageStats } from '@/features/insights/components/sections/insights-page-stats';
import { InsightsPageSnippetsList } from '@/features/snippet-listing/components/sections/insights-page-snippets-list';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/_boundary/')({
    component: DashboardPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Insights',
                },
            ],
        };
    },
    loader: async ({ context: { queryClient } }) => {
        queryClient.infiniteQuery(listCurrentUserSnippetsQueryOptions()).catch();
    },
});

function DashboardPage() {
    return (
        <React.Fragment>
            <div className="mb-6">
                <InsightsPageMainContentHeader />
                <InsightsPageStats />
            </div>
            <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                <React.Suspense fallback={<SectionLoader />}>
                    <InsightsPageSnippetsList />
                </React.Suspense>
            </ErrorBoundary>
        </React.Fragment>
    );
}

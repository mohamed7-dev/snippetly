import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { InsightsPageStats } from '@/features/insights/components/sections/insights-page-stats';
import { InsightsPageSnippetsList } from '@/features/snippet-listing/components/sections/insights-page-snippets-list';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SortDirection } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/')({
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
    loader: ({ context: { queryClient } }) => {
        queryClient
            .infiniteQuery(
                listCurrentUserSnippetsQueryOptions({
                    take: 5,
                    sort: { updatedAt: SortDirection.ASC } as any,
                }),
            )
            .catch();
    },
});

function DashboardPage() {
    return (
        <Page>
            <PageTitle>Insights</PageTitle>
            <PageDescription>Manage and organize your code snippets</PageDescription>
            <div className="space-y-10">
                <div>
                    <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                        <React.Suspense fallback={<SectionLoader />}>
                            <InsightsPageStats />
                        </React.Suspense>
                    </ErrorBoundary>
                </div>

                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <InsightsPageSnippetsList />
                    </React.Suspense>
                </ErrorBoundary>
            </div>
        </Page>
    );
}

import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { InsightsPageMainContentHeader } from '@/features/insights/components/sections/insights-page-main-content-header';
import { InsightsPageStats } from '@/features/insights/components/sections/insights-page-stats';
import { InsightsPageSnippetsList } from '@/features/snippet-listing/components/sections/insights-page-snippets-list';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { Permission } from '@snippetly/common/dto';
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
    const { auth } = Route.useRouteContext();
    return (
        <React.Fragment>
            <div className="mb-6">
                <InsightsPageMainContentHeader />
                <PermissionGuard
                    requiredPermissions={[
                        Permission.Authenticated,
                        Permission.Owner,
                        Permission.ReadDeveloper,
                    ]}
                    ownerId={auth.user?.id}
                >
                    <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                        <React.Suspense fallback={<SectionLoader />}>
                            <InsightsPageStats />
                        </React.Suspense>
                    </ErrorBoundary>
                </PermissionGuard>
            </div>
            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.Owner, Permission.ReadSnippet]}
                ownerId={auth.user?.id}
            >
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <InsightsPageSnippetsList />
                    </React.Suspense>
                </ErrorBoundary>
            </PermissionGuard>
        </React.Fragment>
    );
}

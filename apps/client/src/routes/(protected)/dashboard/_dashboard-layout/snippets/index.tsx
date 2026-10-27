import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem } from '@/components/layout/page-action-bar';
import { CreateSnippetIcon } from '@/components/shared/creation-icons';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { isOfflineDashboardAvailable } from '@/features/offline-snippet/lib/common';
import { SnippetsPageContentActions } from '@/features/snippet-listing/components/sections/snippets-page-content-actions';
import { SnippetsPageMainContent } from '@/features/snippet-listing/components/sections/snippets-page-main-content';
import { SnippetsPageStats } from '@/features/snippet-listing/components/sections/snippets-page-stats';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { currentUserSnippetListDto, Permission } from '@snippetly/common/dto';
import { createFileRoute, Link } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import z from 'zod';

const searchSchema = z
    .object({
        filter: currentUserSnippetListDto.input.shape.filter,
        sort: currentUserSnippetListDto.input.shape.sort,
        filterOperator: currentUserSnippetListDto.input.shape.filterOperator,
        tags: currentUserSnippetListDto.input.shape.tags,
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/snippets/')({
    component: RouteComponent,
    validateSearch: searchSchema,
    head: () => {
        return {
            meta: [
                {
                    title: 'All Snippets',
                },
            ],
        };
    },
    loaderDeps: ({ search: { sort, filter, filterOperator, tags } = {} }) => ({
        sort,
        filter,
        filterOperator,
        tags,
    }),
    loader: async ({ context: { queryClient }, deps }) => {
        if (isOfflineDashboardAvailable()) return;
        await queryClient.infiniteQuery({
            ...listCurrentUserSnippetsQueryOptions(deps, [
                deps.sort,
                deps.filter,
                deps.filterOperator,
                deps.tags,
            ]),
            staleTime: 'static',
        });
    },
});

function RouteComponent() {
    return (
        <Page>
            <PageTitle>My Snippets</PageTitle>
            <PageDescription>Keep your code snippets in one place</PageDescription>
            <PageActionBar>
                <PageActionBarItem>
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                        isAvailableOffline={true}
                    >
                        <Button asChild>
                            <Link to={'/dashboard/snippets/new'} className="ms-auto">
                                <CreateSnippetIcon className="size-4" />
                                <span>New Snippet</span>
                            </Link>
                        </Button>
                    </PermissionGuard>
                </PageActionBarItem>
            </PageActionBar>
            <div className="space-y-8">
                <SnippetsPageContentActions />
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
        </Page>
    );
}

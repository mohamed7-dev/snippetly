import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem } from '@/components/layout/page-action-bar';
import { CreateCollectionIcon } from '@/components/shared/creation-icons';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { CollectionsPageMainContent } from '@/features/collection-listing/components/sections/collections-page-main-content';
import { CollectionsPageMainContentActions } from '@/features/collection-listing/components/sections/collections-page-main-content-actions';
import { CollectionsPageStats } from '@/features/collection-listing/components/sections/collections-page-stats';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { isOfflineDashboardAvailable } from '@/features/offline-snippet/lib/common';
import { currentUserCollectionListDto, Permission } from '@snippetly/common/dto';
import { createFileRoute, Link } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import z from 'zod';

const searchSchema = z
    .object({
        filter: currentUserCollectionListDto.input.shape.filter,
        sort: currentUserCollectionListDto.input.shape.sort,
        filterOperator: currentUserCollectionListDto.input.shape.filterOperator,
        tags: currentUserCollectionListDto.input.shape.tags,
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/collections/')({
    component: CollectionsPage,
    validateSearch: searchSchema,
    head: () => {
        return {
            meta: [
                {
                    title: 'All Collections',
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
            ...listCurrentUserCollectionsQueryOptions(deps, [
                deps.sort,
                deps.filter,
                deps.filterOperator,
                deps.tags,
            ]),
            staleTime: 'static',
        });
    },
});

function CollectionsPage() {
    return (
        <Page>
            <PageTitle>My Collections</PageTitle>
            <PageDescription>
                Organize your code snippets into themed collections for better management
            </PageDescription>
            <PageActionBar>
                <PageActionBarItem>
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateCollection]}
                        isAvailableOffline={true}
                    >
                        <Button asChild>
                            <Link to={'/dashboard/collections/new'} className="ms-auto">
                                <CreateCollectionIcon className="size-4" />
                                <span>New Collection</span>
                            </Link>
                        </Button>
                    </PermissionGuard>
                </PageActionBarItem>
            </PageActionBar>
            <div className="space-y-8">
                <CollectionsPageMainContentActions />
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <CollectionsPageStats />
                    </React.Suspense>
                </ErrorBoundary>
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <CollectionsPageMainContent />
                    </React.Suspense>
                </ErrorBoundary>
            </div>
        </Page>
    );
}

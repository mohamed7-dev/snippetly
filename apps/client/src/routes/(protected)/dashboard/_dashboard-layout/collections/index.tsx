import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { CollectionsPageMainContent } from '@/features/collection-listing/components/sections/collections-page-main-content';
import { CollectionsPageMainContentHeader } from '@/features/collection-listing/components/sections/collections-page-main-content-header';
import { CollectionsPageStats } from '@/features/collection-listing/components/sections/collections-page-stats';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { isOfflineDashboardAvailable } from '@/features/offline-snippet/lib/common';
import { currentUserCollectionListDto } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
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
        <React.Fragment>
            <CollectionsPageMainContentHeader />
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
        </React.Fragment>
    );
}

import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { SnippetsPageContentHeader } from '@/features/snippet-listing/components/sections/snippets-page-content-header';
import { SnippetsPageMainContent } from '@/features/snippet-listing/components/sections/snippets-page-main-content';
import { SnippetsPageStats } from '@/features/snippet-listing/components/sections/snippets-page-stats';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { currentUserSnippetListDto } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import z from 'zod';

const searchSchema = z.object({
    filter: currentUserSnippetListDto.input.shape.filter.optional().default({}).catch({}),
    sort: currentUserSnippetListDto.input.shape.sort.optional().default({}).catch({}),
    filterOperator: currentUserSnippetListDto.input.shape.filterOperator,
    tags: currentUserSnippetListDto.input.shape.tags.optional(),
});

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/_boundary/snippets/')({
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
    loaderDeps: ({ search: { sort, filter, filterOperator, tags } }) => ({
        sort,
        filter,
        filterOperator,
        tags,
    }),
    loader: async ({ context: { queryClient }, deps }) => {
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
        <React.Fragment>
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
        </React.Fragment>
    );
}

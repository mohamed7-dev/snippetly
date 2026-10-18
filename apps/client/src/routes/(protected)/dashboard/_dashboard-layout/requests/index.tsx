import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { RequestsPageMainContentHeader } from '@/features/friendships-listing/components/sections/requests-page-main-content-header';
import { RequestsPageStats } from '@/features/friendships-listing/components/sections/requests-page-stats';
import { RequestsPageTabs } from '@/features/friendships-listing/components/sections/requests-page-tabs';
import { listCurrentUserInboxQueryOptions } from '@/features/friendships-listing/lib/friendships-listing-query-options';
import { currentUserInboxListDto, currentUserOutboxListDto, Permission } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import z from 'zod';

const searchSchema = z
    .object({
        tab: z.enum(['incoming', 'sent']).default('incoming').catch('incoming'),
        incoming: z
            .object({
                sort: currentUserInboxListDto.input.shape.sort,
                filter: currentUserInboxListDto.input.shape.filter,
                filterOperator: currentUserInboxListDto.input.shape.filterOperator,
            })
            .partial(),
        sent: z
            .object({
                sort: currentUserOutboxListDto.input.shape.sort,
                filter: currentUserOutboxListDto.input.shape.filter,
                filterOperator: currentUserOutboxListDto.input.shape.filterOperator,
            })
            .partial(),
    })
    .partial();

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/requests/')({
    component: RequestPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Friendship Requests',
                },
            ],
        };
    },
    validateSearch: searchSchema,
    loaderDeps: ({ search: { incoming } }) => ({ ...incoming }),
    loader: ({ context: { queryClient }, deps }) => {
        queryClient.infiniteQuery(listCurrentUserInboxQueryOptions(deps, Object.values(deps))).catch();
    },
});

function RequestPage() {
    const { user } = useAuth();
    return (
        <div className="space-y-6">
            <RequestsPageMainContentHeader />
            <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                <React.Suspense fallback={<SectionLoader />}>
                    <RequestsPageStats />
                </React.Suspense>
            </ErrorBoundary>
            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.ReadFriendship, Permission.Owner]}
                ownerId={user?.id}
            >
                <RequestsPageTabs />
            </PermissionGuard>
        </div>
    );
}

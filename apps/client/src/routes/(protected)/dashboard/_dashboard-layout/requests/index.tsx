import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem } from '@/components/layout/page-action-bar';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { RequestsPageStats } from '@/features/friendships-listing/components/sections/requests-page-stats';
import { RequestsPageTabs } from '@/features/friendships-listing/components/sections/requests-page-tabs';
import { listCurrentUserInboxQueryOptions } from '@/features/friendships-listing/lib/friendships-listing-query-options';
import { currentUserInboxListDto, currentUserOutboxListDto, Permission } from '@snippetly/common/dto';
import { createFileRoute, Link } from '@tanstack/react-router';
import { UserPlusIcon } from 'lucide-react';
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
    return (
        <Page>
            <PageTitle>Friendship Requests</PageTitle>
            <PageDescription>Manage your incoming and outgoing friendship requests</PageDescription>
            <PageActionBar>
                <PageActionBarItem>
                    <Button asChild>
                        <Link to="/discover">
                            <UserPlusIcon />
                            Find Friends
                        </Link>
                    </Button>
                </PageActionBarItem>
            </PageActionBar>
            <div className="space-y-6">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <RequestsPageStats />
                    </React.Suspense>
                </ErrorBoundary>
                <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.ReadFriendship]}>
                    <RequestsPageTabs />
                </PermissionGuard>
            </div>
        </Page>
    );
}

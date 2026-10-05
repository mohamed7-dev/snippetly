import { RequestsPageMainContentHeader } from '@/features/friendships-listing/components/sections/requests-page-main-content-header';
import { RequestsPageStats } from '@/features/friendships-listing/components/sections/requests-page-stats';
import { RequestsPageTabs } from '@/features/friendships-listing/components/sections/requests-page-tabs';
import { listCurrentUserInboxQueryOptions } from '@/features/friendships-listing/lib/friendships-listing-query-options';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/_boundary/requests')({
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
    loader: async ({ context: { queryClient } }) => {
        queryClient.infiniteQuery(listCurrentUserInboxQueryOptions()).catch();
    },
});

function RequestPage() {
    return (
        <div className="space-y-6">
            <RequestsPageMainContentHeader />
            <RequestsPageStats />
            <RequestsPageTabs />
        </div>
    );
}

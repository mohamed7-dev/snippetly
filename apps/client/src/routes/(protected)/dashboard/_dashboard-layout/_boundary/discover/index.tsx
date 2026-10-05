import { DiscoverPageMainContentHeader } from '@/features/discover/components/sections/discover-page-main-content-header';
import { DiscoverPageTabs } from '@/features/discover/components/sections/discover-page-tabs';
import { discoverDevelopersQueryOptions } from '@/features/discover/lib/discover-query-options';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

const searchSchema = z.object({
    tab: z.enum(['developers', 'snippets', 'collections']).default('developers').catch('developers'),
});

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/_boundary/discover/')({
    component: DiscoverPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Discover',
                },
            ],
        };
    },
    validateSearch: searchSchema,
    loader: async ({ context: { queryClient } }) => {
        queryClient.infiniteQuery(discoverDevelopersQueryOptions()).catch();
    },
});

function DiscoverPage() {
    return (
        <div className="space-y-6">
            <DiscoverPageMainContentHeader />
            <DiscoverPageTabs />
        </div>
    );
}

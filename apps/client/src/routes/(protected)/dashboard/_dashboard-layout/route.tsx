import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/features/app-shell/components/dashboard/dashboard-layout';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { isOfflineDashboardAvailable } from '@/features/offline-snippet/lib/common';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RefreshCwIcon } from 'lucide-react';

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout')({
    component: RouteComponent,
    errorComponent: ({ error, reset }) => (
        <DashboardLayout>
            <StatusCard
                variant="error"
                title="Dashboard section unavailable"
                description={
                    error instanceof Error
                        ? error.message
                        : 'This dashboard section could not be loaded. Please try again.'
                }
                layout="section"
                actions={
                    <Button onClick={reset} size="lg">
                        <RefreshCwIcon className="mr-2 size-4" />
                        Try again
                    </Button>
                }
            />
        </DashboardLayout>
    ),
    loader: ({ context: { queryClient } }) => {
        if (isOfflineDashboardAvailable()) return;
        queryClient
            .infiniteQuery({
                ...listCurrentUserCollectionsQueryOptions({ take: 5 }),
            })
            .catch();
        void queryClient
            .query({
                ...getCurrentDeveloperActivityStats(),
            })
            .catch();
    },
});

function RouteComponent() {
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
}

import { DashboardLayout } from '@/features/app-shell/components/dashboard/dashboard-layout';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout')({
    component: RouteComponent,
    loader: async ({ context: { queryClient } }) => {
        await queryClient.infiniteQuery({
            ...listCurrentUserCollectionsQueryOptions({ take: 5 }),
            staleTime: 'static',
        });
    },
});

function RouteComponent() {
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
}

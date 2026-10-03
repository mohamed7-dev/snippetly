import { PageLoadingView } from '@/components/views/page-loading-view';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard')({
    component: DashboardProtectedLayout,
    beforeLoad: async ({ context: { auth }, location }) => {
        if (!auth || !auth.isAuthenticated) {
            throw redirect({ to: '/sign-in', search: { redirect: location.href } });
        }
    },
    pendingComponent: () => <PageLoadingView />,
});

function DashboardProtectedLayout() {
    return <Outlet />;
}

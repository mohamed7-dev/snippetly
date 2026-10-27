import { StatusCard } from '@/components/feedback/status-card';
import { PageLoadingView } from '@/components/views/page-loading-view';
import { BottomNavigation } from '@/features/app-shell/components/shared/bottom-navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { isOfflineDashboardAvailable, isOfflineDashboardRoute } from '@/features/offline-snippet/lib/common';
import { createFileRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard')({
    component: DashboardProtectedLayout,
    beforeLoad: async ({ context: { auth }, location }) => {
        if (isOfflineDashboardAvailable()) return;

        const status =
            auth.status === 'initial' || auth.status === 'verifying'
                ? await auth.waitForAuthResolution()
                : auth.status;
        if (status === 'unauthenticated') {
            throw redirect({ to: '/sign-in', search: { redirect: location.href } });
        }
    },
    pendingComponent: () => <PageLoadingView />,
});

function DashboardProtectedLayout() {
    const auth = useAuth();
    const pathname = useRouterState({ select: state => state.location.pathname });

    if (isOfflineDashboardAvailable()) {
        if (isOfflineDashboardRoute(pathname)) {
            return (
                <div className="min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
                    <Outlet />
                    <BottomNavigation />
                </div>
            );
        }
        return (
            <StatusCard
                variant="error"
                title="Unavailable offline"
                description="Friends, requests, trash, and settings need an internet connection. Reconnect to open this section."
                layout="page"
            />
        );
    }

    if (auth.status !== 'authenticated' || !auth.isAuthenticated) {
        return <PageLoadingView />;
    }

    return (
        <div className="min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
            <Outlet />
            <BottomNavigation />
        </div>
    );
}

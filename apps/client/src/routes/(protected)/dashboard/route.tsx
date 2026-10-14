import { PageLoadingView } from '@/components/views/page-loading-view';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard')({
    component: DashboardProtectedLayout,
    beforeLoad: ({ context: { auth }, location }) => {
        if (auth?.status === 'unauthenticated') {
            throw redirect({ to: '/sign-in', search: { redirect: location.href } });
        }
    },
    pendingComponent: () => <PageLoadingView />,
});

function DashboardProtectedLayout() {
    const auth = useAuth();

    if (auth.status !== 'authenticated' || !auth.isAuthenticated) {
        return <PageLoadingView />;
    }

    return <Outlet />;
}

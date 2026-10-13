import { PageLoadingView } from '@/components/views/page-loading-view';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

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
    const location = useLocation();
    const navigate = Route.useNavigate();

    useEffect(() => {
        if (auth.status === 'unauthenticated') {
            void navigate({
                to: '/sign-in',
                search: { redirect: location.href },
                replace: true,
            });
        }
    }, [auth.status, location.href, navigate]);

    if (auth.status !== 'authenticated' || !auth.isAuthenticated) {
        return <PageLoadingView />;
    }

    return <Outlet />;
}

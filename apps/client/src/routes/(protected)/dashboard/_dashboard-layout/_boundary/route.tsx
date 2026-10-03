import { ErrorPageView } from '@/components/views/error-page-view';
import { PageLoader } from '@/components/views/page-loading-view';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/_boundary')({
    component: RouteComponent,
    pendingComponent: () => <PageLoader />,
    errorComponent: error => <ErrorPageView error={error.error as Error} reset={error.reset} />,
});

function RouteComponent() {
    return <Outlet />;
}

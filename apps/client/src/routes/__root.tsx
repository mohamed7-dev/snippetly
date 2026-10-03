import type { AuthContextType } from '@/features/auth/components/auth-provider';
import type { QueryClient } from '@tanstack/react-query';
import { HeadContent, Outlet, createRootRouteWithContext } from '@tanstack/react-router';

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
    auth: AuthContextType;
}>()({
    component: RootDocument,
});

function RootDocument() {
    return (
        <div className="min-h-screen bg-background">
            <HeadContent />
            <Outlet />
        </div>
    );
}

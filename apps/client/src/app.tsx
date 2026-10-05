import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import { createPortal } from 'react-dom';
import { Toaster } from 'sonner';
import { DeleteConfirmationProvider } from './components/providers/delete-confirmation-provider';
import { queryClient, TanstackQueryProvider } from './components/providers/tanstack-query-provider';
import { ThemeProvider } from './components/providers/theme-provider';
import { ErrorPageView } from './components/views/error-page-view';
import { NotFoundPageView, type NotFoundMetaData } from './components/views/not-found-page-view';
import { PageLoader } from './components/views/page-loading-view';
import { useAuth } from './features/auth/hooks/use-auth';
import { AuthProvider } from './features/auth/providers/auth-provider';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
    routeTree,
    context: {
        queryClient,
        // auth will initially be undefined
        // We'll be passing down the auth state from within a React component
        auth: undefined as any,
    },
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: meta => {
        return (
            <NotFoundPageView
                title={(meta.data as NotFoundMetaData).title}
                description={(meta.data as NotFoundMetaData).description}
            />
        );
    },
    defaultPendingComponent: () => {
        return <PageLoader containerProps={{ className: 'min-h-screen' }} />;
    },
    defaultErrorComponent: e => {
        return <ErrorPageView error={e.error as Error} reset={e.reset} />;
    },
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Development: Lazy load DevTools components
const LazyDevTools = React.lazy(async () => {
    if (import.meta.env.DEV) {
        const [{ TanstackDevtools }, { TanStackRouterDevtoolsPanel }, { ReactQueryDevtoolsPanel }] =
            await Promise.all([
                import('@tanstack/react-devtools'),
                import('@tanstack/react-router-devtools'),
                import('@tanstack/react-query-devtools'),
            ]);

        return {
            default: () => (
                <TanstackDevtools
                    config={{
                        position: 'bottom-right',
                    }}
                    plugins={[
                        {
                            name: 'Tanstack Router',
                            render: <TanStackRouterDevtoolsPanel router={router} />,
                        },
                        {
                            name: 'Tanstack Query',
                            render: <ReactQueryDevtoolsPanel client={queryClient} />,
                        },
                    ]}
                />
            ),
        };
    }

    // Production: Return empty component
    return { default: () => <></> };
});

function InnerApp() {
    const auth = useAuth();
    return <RouterProvider router={router} context={{ auth }} />;
}

export function App() {
    return (
        <React.Fragment>
            <TanstackQueryProvider>
                <AuthProvider>
                    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
                        <DeleteConfirmationProvider>
                            <InnerApp />
                            {createPortal(<Toaster position="top-center" />, document.body)}
                        </DeleteConfirmationProvider>
                    </ThemeProvider>
                </AuthProvider>
            </TanstackQueryProvider>

            <React.Suspense fallback={null}>
                <LazyDevTools />
            </React.Suspense>
        </React.Fragment>
    );
}

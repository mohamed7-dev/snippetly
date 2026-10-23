import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/collections')({
    beforeLoad: ({ location }) => {
        if (location.pathname.replace(/\/+$/, '') === '/collections') {
            throw redirect({ to: '/' });
        }
    },
    component: CollectionsLayout,
});

function CollectionsLayout() {
    return <Outlet />;
}

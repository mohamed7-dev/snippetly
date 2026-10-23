import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/developers')({
    beforeLoad: ({ location }) => {
        if (location.pathname.replace(/\/+$/, '') === '/developer') {
            throw redirect({ to: '/' });
        }
    },
    component: DevelopersLayout,
});

function DevelopersLayout() {
    return <Outlet />;
}

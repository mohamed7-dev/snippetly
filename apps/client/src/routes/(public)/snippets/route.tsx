import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/snippets')({
    beforeLoad: ({ location }) => {
        if (location.pathname.replace(/\/+$/, '') === '/snippets') {
            throw redirect({ to: '/' });
        }
    },
    component: SnippetsLayout,
});

function SnippetsLayout() {
    return <Outlet />;
}

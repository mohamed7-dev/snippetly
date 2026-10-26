import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/snippets/$id')({
    component: Outlet,
    beforeLoad: ({ params, location }) => {
        if (location.pathname.replace(/\/+$/, '') === `/dashboard/snippets/${params.id}`) {
            throw redirect({ to: '/snippets/$id', params: { id: params.id } });
        }
    },
});

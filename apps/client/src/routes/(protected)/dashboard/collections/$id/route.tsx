import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/collections/$id')({
    component: EditCollectionLayout,
    beforeLoad: ({ params, location }) => {
        if (location.pathname.replace(/\/+$/, '') === `/dashboard/collections/${params.id}`) {
            throw redirect({ to: '/collections/$id', params: { id: params.id } });
        }
    },
});

function EditCollectionLayout() {
    return <Outlet />;
}

import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/collections/$id')({
    component: ProtectedCollectionLayout,
    loader: async ({ context: { queryClient }, params: { id } }) => {
        await queryClient.query({ ...getCollectionQueryOptions(id), staleTime: 'static' });
    },
});

function ProtectedCollectionLayout() {
    return <Outlet />;
}

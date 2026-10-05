import { getSnippetQueryOptions } from '@/features/snippets/lib/snippet-query-options';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/snippets/$id')({
    component: SnippetLayout,
    loader: async ({ context: { queryClient }, params: { id } }) => {
        await queryClient.query({ ...getSnippetQueryOptions(id), staleTime: 'static' });
    },
});

function SnippetLayout() {
    return <Outlet />;
}

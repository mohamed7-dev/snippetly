import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/_boundary/')({
    component: DashboardPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'All Snippets',
                },
            ],
        };
    },
    loader: async ({ context: { queryClient } }) => {
        // queryClient.prefetchInfiniteQuery(getCurrentSnippetsOptions);
    },
});

function DashboardPage() {
    throw new Error('Error');
    return <p>Content</p>;
}

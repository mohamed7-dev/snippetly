import { OfflineSnippetsListing } from '@/features/offline-snippet/components/sections/offline-snippets-listing';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/offline/snippets/')({
    component: OfflineSnippetsPage,
});

function OfflineSnippetsPage() {
    return (
        <main className="container mx-auto max-w-6xl px-3 py-8 md:px-6">
            <OfflineSnippetsListing />
        </main>
    );
}

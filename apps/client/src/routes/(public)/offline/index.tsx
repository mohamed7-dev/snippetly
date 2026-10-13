import { OfflineSnippetsList } from '@/features/offline-snippet/components/sections/offline-snippets-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/offline/')({
    component: OfflineLibraryPage,
});

function OfflineLibraryPage() {
    return (
        <main className="container mx-auto px-3 py-8 md:px-6 max-w-6xl">
            <OfflineSnippetsList />
        </main>
    );
}

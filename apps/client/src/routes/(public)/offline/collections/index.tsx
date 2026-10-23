import { OfflineCollectionsList } from '@/features/offline-snippet/components/sections/offline-collections-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/offline/collections/')({
    component: OfflineCollectionsPage,
});

function OfflineCollectionsPage() {
    return (
        <main className="container mx-auto max-w-6xl px-3 py-8 md:px-6">
            <OfflineCollectionsList />
        </main>
    );
}

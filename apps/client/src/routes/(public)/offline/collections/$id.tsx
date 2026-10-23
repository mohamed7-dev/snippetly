import { OfflineCollectionPageContent } from '@/features/offline-snippet/components/sections/offline-collection-page-content';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/offline/collections/$id')({
    component: OfflineCollectionPage,
});

function OfflineCollectionPage() {
    const { id } = Route.useParams();
    return (
        <main className="container mx-auto max-w-6xl px-3 py-8 md:px-6">
            <OfflineCollectionPageContent id={id} />
        </main>
    );
}

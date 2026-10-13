import { OfflineSnippetPageContent } from '@/features/offline-snippet/components/sections/offline-snippet-page-content';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/offline/$id')({
    component: OfflineSnippetPage,
});

function OfflineSnippetPage() {
    const { id } = Route.useParams();
    return (
        <main className="container mx-auto px-3 py-8 md:px-6 max-w-6xl">
            <OfflineSnippetPageContent id={id} />
        </main>
    );
}

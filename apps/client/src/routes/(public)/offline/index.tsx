import { SectionLoader } from '@/components/feedback/section-loader';
import { Page } from '@/components/layout/page';
import { OfflineRecentCollectionsList } from '@/features/offline-snippet/components/sections/offline-recent-collections-list';
import { OfflineRecentSnippetsList } from '@/features/offline-snippet/components/sections/offline-recent-snippets-list';
import { useOfflineCollectionStore } from '@/features/offline-snippet/hooks/use-offline-collection-store';
import { useOfflineSnippetStore } from '@/features/offline-snippet/hooks/use-offline-snippet-store';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/offline/')({
    component: OfflineLibraryPage,
});

function OfflineLibraryPage() {
    const {
        list: { data: savedSnippets, isPending: snippetsPending },
    } = useOfflineSnippetStore();
    const {
        list: { data: savedCollections, isPending: collectionsPending },
    } = useOfflineCollectionStore();

    if (snippetsPending || collectionsPending) {
        return <SectionLoader message="Loading offline library..." />;
    }

    return (
        <main>
            <Page className="container mx-auto px-3 py-8 md:px-6 max-w-6xl">
                <div className="space-y-10">
                    <OfflineRecentCollectionsList savedCollections={savedCollections ?? []} />
                    <OfflineRecentSnippetsList
                        savedCollections={savedCollections ?? []}
                        savedSnippets={savedSnippets ?? []}
                    />
                </div>
            </Page>
        </main>
    );
}

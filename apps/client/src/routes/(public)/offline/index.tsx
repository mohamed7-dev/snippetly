import { OfflineSnippetsList } from '@/features/offline-snippet/components/sections/offline-snippets-list';
import { OfflineSnippetsPageHeader } from '@/features/offline-snippet/components/sections/offline-snippets-page-header';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/(public)/offline/')({
    component: OfflineLibraryPage,
});

function OfflineLibraryPage() {
    return (
        <React.Fragment>
            <OfflineSnippetsPageHeader />
            <main className="container mx-auto px-3 md:px-6 py-8 max-w-6xl">
                <OfflineSnippetsList />
            </main>
        </React.Fragment>
    );
}

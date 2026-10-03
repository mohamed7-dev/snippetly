import { OfflineSnippetPageContent } from '@/features/offline-snippet/components/sections/offline-snippet-page-content';
import { OfflineSnippetPageHeader } from '@/features/offline-snippet/components/sections/offline-snippet-page-header';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/(public)/offline/$id')({
    component: OfflineSnippetPage,
});

function OfflineSnippetPage() {
    const { id } = Route.useParams();
    return (
        <React.Fragment>
            <OfflineSnippetPageHeader />
            <main className="container mx-auto px-3 md:px-6 py-8 max-w-6xl">
                <OfflineSnippetPageContent id={id} />
            </main>
        </React.Fragment>
    );
}

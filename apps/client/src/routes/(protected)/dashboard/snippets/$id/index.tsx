import { queryClient } from '@/components/providers/tanstack-query-provider';
import { SnippetPageContentHeader } from '@/features/snippets/components/sections/snippet-page-content-header';
import { SnippetPageHeader } from '@/features/snippets/components/sections/snippet-page-header';
import { SnippetPageSidebar } from '@/features/snippets/components/sections/snippet-page-sidebar';
import { SnippetCodeBlock } from '@/features/snippets/components/shared/snippet-code-block';
import { SnippetNoteBlock } from '@/features/snippets/components/shared/snippet-notes-block';
import { getSnippetQueryOptions } from '@/features/snippets/lib/snippet-query-options';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/(protected)/dashboard/snippets/$id/')({
    component: SnippetPage,
    head: async ({ params }) => {
        const data = await queryClient.query({ ...getSnippetQueryOptions(params.id) });
        return {
            meta: [
                {
                    name: 'description',
                    content: data.description ?? `Snippet: ${data.name} info`,
                },
                {
                    title: data.name,
                },
            ],
        };
    },
});

function SnippetPage() {
    const { id } = Route.useParams();
    const { data: snippet } = useSuspenseQuery(getSnippetQueryOptions(id));
    return (
        <React.Fragment>
            <SnippetPageHeader />
            <main className="container mx-auto px-3 md:px-6 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        <SnippetPageContentHeader />
                        <SnippetCodeBlock snippet={snippet} />
                        <SnippetNoteBlock snippet={snippet} />
                    </div>
                    <SnippetPageSidebar />
                </div>
            </main>
        </React.Fragment>
    );
}

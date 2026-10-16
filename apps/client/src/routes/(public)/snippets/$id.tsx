import { queryClient } from '@/components/providers/tanstack-query-provider';
import { SnippetPageContentHeader } from '@/features/snippets/components/sections/snippet-page-content-header';
import { SnippetPageSidebar } from '@/features/snippets/components/sections/snippet-page-sidebar';
import { SnippetCodeBlock } from '@/features/snippets/components/shared/snippet-code-block';
import { SnippetNoteBlock } from '@/features/snippets/components/shared/snippet-notes-block';
import { getSnippetQueryOptions } from '@/features/snippets/lib/snippet-query-options';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/(public)/snippets/$id')({
    component: SnippetPage,
    head: async ({ params }) => {
        const data = await queryClient.query({ ...getSnippetQueryOptions(params.id), staleTime: 'static' });
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
    loader: async ({ context: { queryClient }, params: { id } }) => {
        return await queryClient.query({ ...getSnippetQueryOptions(id), staleTime: 'static' });
    },
});

function SnippetPage() {
    const { id } = Route.useParams();
    const { data: snippet } = useSuspenseQuery(getSnippetQueryOptions(id));
    return (
        <React.Fragment>
            <main className="container mx-auto px-3 md:px-6 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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

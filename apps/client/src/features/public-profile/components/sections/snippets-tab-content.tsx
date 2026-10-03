import { listCreatorSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

export function SnippetsTabContent() {
    const { id } = useParams({ from: '/(public)/profile/$id' });
    const { data } = useSuspenseInfiniteQuery(listCreatorSnippetsQueryOptions(id));
    const snippets = data?.pages?.flatMap(p => p.items) ?? [];

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {snippets.map(snippet => (
                <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
        </div>
    );
}

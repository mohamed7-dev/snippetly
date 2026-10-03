import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { Button } from '@/components/ui/button';
import { listCollectionSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { Code2Icon, PlusIcon } from 'lucide-react';

export function CollectionPageSnippetsList() {
    const params = useParams({
        from: '/(protected)/dashboard/collections/$id/',
    });

    // snippets
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCollectionSnippetsQueryOptions(params.id),
    );

    const snippets = data.pages.flatMap(page => page.items);
    const total = data.pages[0]?.itemsCount ?? 0;

    // const filteredSnippets = useFilter({ data: snippets, filter });

    const qClient = useQueryClient();

    const onSnippetMutationSuccess = () => {
        qClient.invalidateQueries(listCollectionSnippetsQueryOptions(params.id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-xl">Snippets ({total})</h2>
                {/* <div className="flex items-center gap-2">
                    <FilterMenu
                        onSelect={selected => navigate({ search: { filter: selected } })}
                        selected={filter}
                    />
                </div> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {snippets.map(snippet => (
                    <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        deleteSnippet={{
                            onSuccess: onSnippetMutationSuccess,
                        }}
                        forkSnippet={{
                            onSuccess: onSnippetMutationSuccess,
                        }}
                    />
                ))}
            </div>
            <InfiniteLoader
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={() => {
                    void fetchNextPage();
                }}
                Content={
                    !snippets?.length ? (
                        <div className="text-center py-12">
                            <Code2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-heading font-semibold text-lg mb-2">
                                No snippets in this collection
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Add your first snippet to get started
                            </p>
                            <Button asChild>
                                <Link to="/dashboard/snippets/new">
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Snippet
                                </Link>
                            </Button>
                        </div>
                    ) : null
                }
            />
        </div>
    );
}

import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { useFilter } from '@/components/filter-menu';
import { Button } from '@/components/ui/button';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { getCurrentSnippetsOptions } from '@/features/snippets/lib/api';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';

export function SnippetsSection() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useSuspenseInfiniteQuery(getCurrentSnippetsOptions);
    console.log({ data });
    const snippets = data.pages.flatMap(p => p.data.items) ?? [];
    const { filter } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_error-boundary/',
    });

    const filteredSnippets = useFilter<typeof snippets>({
        data: snippets,
        filter,
    });
    const qClient = useQueryClient();
    const onMutateSnippetSuccess = () => {
        qClient.invalidateQueries({ queryKey: ['users', 'current', 'dashboard'] });
    };
    return (
        <React.Fragment>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSnippets?.map(snippet => (
                    <SnippetCard
                        key={snippet.slug}
                        snippet={{ ...snippet }}
                        deleteSnippet={{
                            onSuccess: onMutateSnippetSuccess,
                        }}
                        forkSnippet={{
                            onSuccess: onMutateSnippetSuccess,
                        }}
                    />
                ))}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !filteredSnippets.length ? (
                        <StatusCard
                            variant="empty"
                            title="No snippets yet"
                            description="Create your first code snippet to get started"
                            layout="section"
                            actions={
                                <Button asChild>
                                    <Link to="/dashboard/snippets/new">
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        <span>Create Snippet</span>
                                    </Link>
                                </Button>
                            }
                        />
                    ) : null
                }
            />
        </React.Fragment>
    );
}

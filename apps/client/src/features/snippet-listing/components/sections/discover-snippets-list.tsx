import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { discoverSnippetsQueryOptions } from '@/features/discover/lib/discover-query-options';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';

export function DiscoverSnippetsList() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        discoverSnippetsQueryOptions(),
    );
    const snippets = data.pages?.flatMap(p => p.items) ?? [];
    return (
        <React.Fragment>
            <div className="grid gap-4 lg:grid-cols-2">
                {snippets.map(snippet => (
                    <SnippetCard key={snippet.id} snippet={snippet} />
                ))}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !snippets.length ? (
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

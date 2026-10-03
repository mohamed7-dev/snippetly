import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { FilterMenu, useFilter } from '@/components/filter-menu';
import { Button } from '@/components/ui/button';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { getCurrentUserFriendsSnippets } from '../../lib/api';

export function FriendsSnippetsTabContent() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
        getCurrentUserFriendsSnippets,
    );
    const snippets = data?.pages?.flatMap(p => p.items) ?? [];

    const { filter } = useSearch({ from: '/(protected)/dashboard/friends' });
    const navigate = useNavigate({ from: '/dashboard/friends' });
    const filteredSnippets = useFilter({ data: snippets, filter });

    return (
        <React.Fragment>
            <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-xl">Friends' Snippets</h2>
                <div className="flex items-center gap-2">
                    <FilterMenu
                        selected={filter}
                        onSelect={selected => navigate({ search: { filter: selected } })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSnippets.map(snippet => (
                    <SnippetCard snippet={{ ...snippet, isPrivate: false }} />
                ))}
            </div>
            <InfiniteLoader
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                Content={
                    !filteredSnippets.length ? (
                        <StatusCard
                            variant="empty"
                            title="No friends' snippets yet"
                            description="Add friends to discover their snippets."
                            layout="section"
                            actions={
                                <Button asChild>
                                    <Link to="/dashboard/discover">
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        <span>Discover Developers</span>
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

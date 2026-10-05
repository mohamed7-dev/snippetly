import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import {
    listCreatorSnippetsQueryOptions,
    listCurrentUserFriendsSnippetsQueryOptions,
} from '../../lib/snippet-listing-query-options';

export function CurrentUserFriendsSnippets({
    friendId,
    onClearingFriendId,
}: {
    friendId?: string;
    onClearingFriendId?: () => void;
}) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...listCurrentUserFriendsSnippetsQueryOptions(),
        enabled: friendId ? false : true,
    });
    const snippets = data?.pages?.flatMap(p => p.items) ?? [];

    const {
        data: friendSnippetsData,
        fetchNextPage: friendFetchNextPage,
        hasNextPage: friendHasNextPage,
        isFetchingNextPage: friendIsFetchingNextPage,
    } = useInfiniteQuery({
        ...listCreatorSnippetsQueryOptions(friendId as string),
        enabled: !!friendId,
    });
    const friendSnippets = friendSnippetsData?.pages?.flatMap(p => p.items) ?? [];

    const friendName = !friendId
        ? undefined
        : friendSnippets.length > 0
          ? friendSnippets[0]?.creator.firstName + ' ' + friendSnippets[0]?.creator.lastName
          : `Friend`;

    return (
        <React.Fragment>
            <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-xl capitalize">
                    {!friendName ? "Friends' Snippets" : `${friendName}'s Snippets`}
                </h2>
                {friendName && (
                    <Button onClick={() => onClearingFriendId?.()}>View All Friend's Snippets</Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {(friendId ? friendSnippets : snippets).map(snippet => (
                    <SnippetCard key={snippet.id} snippet={snippet} />
                ))}
            </div>
            <InfiniteLoader
                isFetchingNextPage={friendId ? friendIsFetchingNextPage : isFetchingNextPage}
                hasNextPage={friendId ? friendHasNextPage : hasNextPage}
                fetchNextPage={friendId ? friendFetchNextPage : fetchNextPage}
                Content={
                    !(friendId ? friendSnippets : snippets).length ? (
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

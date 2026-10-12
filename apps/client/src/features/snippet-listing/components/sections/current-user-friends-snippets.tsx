import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { SnippetListLayout } from '@/components/shared/snippet-list-layout';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { Permission, userFriendsSnippetsListDto } from '@snippetly/common/dto';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
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
    const { snippets: snippetSearch } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/friends/',
    });
    const { sort, filter, filterOperator, tags } = snippetSearch ?? {};

    const queryKeys = [sort, filter, filterOperator, tags];
    const navigate = useNavigate();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        ...listCurrentUserFriendsSnippetsQueryOptions({ sort, filter, filterOperator, tags }, queryKeys),
        enabled: friendId ? false : true,
    });
    const snippets = data?.pages?.flatMap(p => p.items) ?? [];

    const {
        data: friendSnippetsData,
        fetchNextPage: friendFetchNextPage,
        hasNextPage: friendHasNextPage,
        isFetchingNextPage: friendIsFetchingNextPage,
    } = useInfiniteQuery({
        ...listCreatorSnippetsQueryOptions(
            friendId as string,
            { sort, filter, filterOperator, tags },
            queryKeys,
        ),
        enabled: !!friendId,
    });
    const friendSnippets = friendSnippetsData?.pages?.flatMap(p => p.items) ?? [];

    const friendName = !friendId
        ? undefined
        : friendSnippets.length > 0
          ? formatDeveloperInfo(friendSnippets[0].creator).fullName
          : `Friend`;

    const availableTags = [
        ...new Set(
            (friendId ? friendSnippets : snippets)
                .flatMap(snippet => snippet.tags ?? [])
                .map(tag => tag.value),
        ),
    ];

    return (
        <React.Fragment>
            <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-xl capitalize">
                    {!friendName ? "Friends' Snippets" : `${friendName}'s Snippets`}
                </h2>
                <div className="flex items-center gap-3">
                    <TagFilterBar
                        tags={availableTags}
                        selectedTags={tags?.values ?? []}
                        operator={tags?.operator}
                        onChange={(values, operator) =>
                            navigate({
                                to: '.',
                                search: previous => ({
                                    ...previous,
                                    snippets: {
                                        ...previous.snippets,
                                        tags: values.length ? { values, operator } : undefined,
                                    },
                                }),
                            })
                        }
                    />
                    <FilterQueryDialog
                        schema={userFriendsSnippetsListDto.input.shape.filter}
                        value={{ filter, filterOperator }}
                        onApply={val =>
                            navigate({
                                to: '.',
                                search: prev => ({
                                    ...prev,
                                    snippets: { ...prev.snippets, filter: val },
                                }),
                            })
                        }
                    />
                    <SortQueryDialog
                        sortSchema={userFriendsSnippetsListDto.input.shape.sort}
                        value={{ sort }}
                        onApply={val =>
                            navigate({
                                to: '.',
                                search: prev => ({
                                    ...prev,
                                    snippets: { ...prev.snippets, sort: val.sort },
                                }),
                            })
                        }
                    />
                    {friendName && (
                        <Button onClick={() => onClearingFriendId?.()}>View All Friends' Snippets</Button>
                    )}
                </div>
            </div>

            <SnippetListLayout>
                {(friendId ? friendSnippets : snippets).map(snippet => (
                    <PermissionGuard
                        key={snippet.id}
                        requiredPermissions={[Permission.Authenticated, Permission.ReadSnippet]}
                    >
                        <SnippetCard snippet={snippet} />
                    </PermissionGuard>
                ))}
            </SnippetListLayout>
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

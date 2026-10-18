import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { DeveloperIdentity } from '@/components/shared/developer-identity';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { DeveloperActionsDropdown } from '@/features/developer-actions/components/developer-actions-dropdown';
import { CurrentUserFriendsSnippets } from '@/features/snippet-listing/components/sections/current-user-friends-snippets';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { currentUserFriendsListDto } from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { useQuery, useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { listCurrentUserFriendsQueryOptions } from '../../lib/friendships-listing-query-options';

export function FriendsPageTabs() {
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/friends/',
    });
    const { tab, snippets } = search ?? {};
    const friendId = snippets?.friendId;
    const navigate = useNavigate();

    const { data } = useQuery(getCurrentDeveloperActivityStats());
    return (
        <Tabs defaultValue="friends" value={tab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                    value="friends"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'friends' }) })}
                >
                    My Friends ({data?.friendsCount ?? 0})
                </TabsTrigger>
                <TabsTrigger
                    value="snippets"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'snippets' }) })}
                >
                    Friends' Snippets
                </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-6">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <FriendsTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="snippets" className="space-y-6">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <CurrentUserFriendsSnippets
                            friendId={friendId}
                            onClearingFriendId={() =>
                                navigate({
                                    to: '.',
                                    search: prev => ({
                                        ...prev,
                                        snippets: snippets ? omit(snippets, ['friendId']) : undefined,
                                    }),
                                })
                            }
                        />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

function FriendsTabContent() {
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/friends/',
    });
    const { filter, filterOperator, sort } = search?.friends ?? {};
    const queryKeys = [filter, filterOperator, sort];
    const navigate = useNavigate();
    const qClient = useQueryClient();
    const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserFriendsQueryOptions({ filter, filterOperator, sort }, queryKeys),
    );
    const { user } = useAuth();

    const friendships = (data.pages?.flatMap(p => p.items) ?? []).map(f => {
        if (f.requester.id === user?.id) {
            const addressee = f.addressee;
            const friendship = omit(f, ['requester', 'addressee']);
            return { ...friendship, friend: addressee };
        } else {
            const requester = f.requester;
            const friendship = omit(f, ['requester', 'addressee']);
            return { ...friendship, friend: requester };
        }
    });

    const onMutateFavSuccess = (actionType: 'add' | 'remove') => {
        // TODO: update qClient cache to achieve optimistic update to the isFavouritedByCurrentUser prop
        // and revert to the previous state otherwise, also trigger the re-invalidation
        qClient.invalidateQueries(listCurrentUserFriendsQueryOptions(undefined, queryKeys));
    };

    return (
        <React.Fragment>
            <div className="flex items-center gap-4 my-6">
                <FilterQueryDialog
                    schema={currentUserFriendsListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({ ...prev, friends: { ...prev?.friends, ...val } }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={currentUserFriendsListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({ ...prev, friends: { ...prev?.friends, sort: val.sort } }),
                        })
                    }
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friendships.map(item => (
                    <Card key={item.id} className="border-border hover:shadow-lg transition-shadow">
                        <CardHeader className="space-y-2">
                            <div className="flex justify-between">
                                <DeveloperIdentity developerInfo={item.friend} />
                                <DeveloperActionsDropdown
                                    developer={item.friend}
                                    friendshipInfo={{
                                        isFriendWithCurrentUser: true,
                                        friendshipStatus: item.status,
                                    }}
                                    favouriteInfo={{
                                        isFavouritedByCurrentUser: item.friend.isFavouritedByCurrentUser,
                                    }}
                                    showAddToFavourites={true}
                                    showRemoveFromFavourites={true}
                                    showViewProfile={true}
                                    addDeveloperToFavourites={{
                                        onSuccess: () => onMutateFavSuccess('add'),
                                    }}
                                    removeDeveloperFromFavourites={{
                                        onSuccess: () => onMutateFavSuccess('remove'),
                                    }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground text-pretty">{item.friend.bio}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!!item.friend.recentSnippets?.length && (
                                <div className="space-y-4">
                                    <p className="text-sm font-medium">Recent Snippets</p>
                                    {item.friend.recentSnippets?.map(snippet => (
                                        <div
                                            key={snippet.id}
                                            className="flex items-center justify-between gap-2 text-sm"
                                        >
                                            <Link
                                                to={'/snippets/$id'}
                                                params={{ id: snippet.id }}
                                                className="flex items-center justify-between gap-2 text-sm hover:text-primary hover:underline"
                                            >
                                                <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                                                <span className="truncate flex-1">{snippet.name}</span>
                                            </Link>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline" className="text-xs font-mono">
                                                    {snippet.language}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <Button size="sm" variant="outline">
                                    <Link
                                        to="."
                                        search={prev => ({
                                            ...prev,
                                            tab: 'snippets',
                                            snippets: { ...prev?.snippets, friendId: item.friend.id },
                                        })}
                                    >
                                        View Snippets
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <InfiniteLoader
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                Content={
                    !friendships.length ? (
                        <StatusCard
                            variant="empty"
                            title="No friends yet"
                            description="Add your first friend to start learning from others."
                            layout="section"
                            actions={
                                <Button asChild>
                                    <Link to="/discover">
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

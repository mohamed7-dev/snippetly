import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { DeveloperIdentity } from '@/components/shared/developer-identity';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeveloperActionsDropdown } from '@/features/developer-actions/components/developer-actions-dropdown';
import { AcceptFriendshipRequestButton } from '@/features/friendship/components/accept-friendship-request-button';
import { CancelFriendshipRequestButton } from '@/features/friendship/components/cancel-friendship-request-button';
import { RejectFriendshipRequestButton } from '@/features/friendship/components/reject-friendship-request-buttton';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { currentUserInboxListDto, currentUserOutboxListDto } from '@snippetly/common/dto';
import { useQuery, useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { UserPlusIcon } from 'lucide-react';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
    listCurrentUserInboxQueryOptions,
    listCurrentUserOutboxQueryOptions,
} from '../../lib/friendships-listing-query-options';

export function RequestsPageTabs() {
    const { tab } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/requests/',
    });
    const navigate = useNavigate();

    const { data } = useQuery(getCurrentDeveloperActivityStats());
    const stats = data?.stats ?? { friendsInboxCount: 0, friendsOutboxCount: 0 };

    return (
        <Tabs defaultValue="incoming" value={tab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                    value="incoming"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'incoming' }) })}
                >
                    Incoming ({stats.friendsInboxCount})
                </TabsTrigger>
                <TabsTrigger
                    value="sent"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'sent' }) })}
                >
                    Sent ({stats.friendsOutboxCount})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <InboxTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <OutboxTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

function InboxTabContent() {
    const { incoming } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/requests/',
    });
    const navigate = useNavigate();
    const qClient = useQueryClient();

    const { filter, filterOperator, sort } = incoming ?? {};

    const queryKeys = [filter, filterOperator, sort];

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserInboxQueryOptions({ filter, filterOperator, sort }, queryKeys),
    );
    const inboxFriendships = data.pages?.flatMap(p => p.items) ?? [];
    const onMutateSuccess = () => {
        qClient.invalidateQueries(listCurrentUserInboxQueryOptions(undefined, queryKeys));
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <FilterQueryDialog
                    schema={currentUserInboxListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({ ...prev, incoming: { ...prev?.incoming, ...val } }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={currentUserInboxListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({ ...prev, incoming: { ...prev?.incoming, sort: val.sort } }),
                        })
                    }
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inboxFriendships.map(request => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="space-y-8">
                            <div className="flex items-center justify-between">
                                <DeveloperIdentity developerInfo={request.requester} />
                                <DeveloperActionsDropdown
                                    developer={request.requester}
                                    friendshipInfo={{
                                        isFriendWithCurrentUser: false,
                                        friendshipStatus: request.status,
                                    }}
                                    favouriteInfo={{
                                        isFavouritedByCurrentUser:
                                            request.requester.relationshipWithCurrentUser
                                                .isFavouritedByCurrentUser,
                                    }}
                                    showAcceptFriendshipRequest={true}
                                    showRejectFriendshipRequest={true}
                                    showAddToFavourites={true}
                                    showRemoveFromFavourites={true}
                                    showViewProfile={true}
                                    addDeveloperToFavourites={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                    removeDeveloperFromFavourites={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                    acceptFriendshipRequest={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                    rejectFriendshipRequest={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                />
                            </div>
                            <p>
                                <strong className="text-sm capitalize text-muted-foreground">
                                    Request arrived at :{' '}
                                </strong>
                                <Badge variant="secondary" className="text-xs">
                                    {new Date(request.createdAt)?.toLocaleDateString()}
                                </Badge>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {request.requester.bio ??
                                    `No info available about ${request.requester.firstName}`}
                            </p>
                            <div className="flex items-center gap-4">
                                <AcceptFriendshipRequestButton
                                    friendId={request.requester.id}
                                    variant={'outline'}
                                    acceptFriendshipRequestMutationCallbacks={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                />
                                <RejectFriendshipRequestButton
                                    friendId={request.requester.id}
                                    variant={'destructive-outline'}
                                    rejectFriendshipRequestMutationCallbacks={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !inboxFriendships.length ? (
                        <StatusCard
                            variant="empty"
                            title="No Incoming Requests"
                            description="You don't have any pending friend requests at the moment."
                            actions={
                                <Button asChild>
                                    <Link to="/discover" search={{ tab: 'developers' }}>
                                        <UserPlusIcon />
                                        Discover Developers
                                    </Link>
                                </Button>
                            }
                        />
                    ) : null
                }
            />
        </div>
    );
}

export function OutboxTabContent() {
    const { sent } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/requests/',
    });
    const navigate = useNavigate();
    const qClient = useQueryClient();

    const { filter, filterOperator, sort } = sent ?? {};
    const queryKeys = [filter, filterOperator, sort];
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserOutboxQueryOptions({ filter, filterOperator, sort }, queryKeys),
    );
    const outboxFriendships = data.pages?.flatMap(p => p.items) ?? [];

    const onMutateSuccess = () => {
        qClient.invalidateQueries(listCurrentUserOutboxQueryOptions(undefined, queryKeys));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <FilterQueryDialog
                    schema={currentUserOutboxListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({ ...prev, sent: { ...prev?.sent, ...val } }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={currentUserOutboxListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({ ...prev, sent: { ...prev?.sent, sort: val.sort } }),
                        })
                    }
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outboxFriendships.map(request => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="space-y-8">
                            <div className="flex items-center justify-between">
                                <DeveloperIdentity developerInfo={request.addressee} />

                                <DeveloperActionsDropdown
                                    developer={request.addressee}
                                    friendshipInfo={{
                                        isFriendWithCurrentUser: false,
                                        friendshipStatus: request.status,
                                    }}
                                    favouriteInfo={{
                                        isFavouritedByCurrentUser:
                                            request.addressee.relationshipWithCurrentUser
                                                .isFavouritedByCurrentUser,
                                    }}
                                    showCancelFriendshipRequest={true}
                                    showAddToFavourites={true}
                                    showRemoveFromFavourites={true}
                                    showViewProfile={true}
                                    addDeveloperToFavourites={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                    removeDeveloperFromFavourites={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                    cancelFriendshipRequest={{
                                        onSuccess: onMutateSuccess,
                                    }}
                                />
                            </div>
                            <p>
                                <strong className="text-sm capitalize text-muted-foreground">
                                    Request sent at :{' '}
                                </strong>
                                <Badge variant="secondary" className="text-xs">
                                    {new Date(request.createdAt)?.toLocaleDateString()}
                                </Badge>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {request.addressee.bio ??
                                    `No info available about ${request.addressee.firstName}`}
                            </p>
                            <CancelFriendshipRequestButton
                                friendId={request.addressee.id}
                                variant={'outline'}
                                cancelFriendshipRequestMutationCallbacks={{
                                    onSuccess: onMutateSuccess,
                                }}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !outboxFriendships.length ? (
                        <StatusCard
                            variant="empty"
                            title="No Sent Requests"
                            description="You haven't sent any friend requests recently."
                            actions={
                                <Button asChild>
                                    <Link to="/discover" search={{ tab: 'developers' }}>
                                        <UserPlusIcon />
                                        Discover developers
                                    </Link>
                                </Button>
                            }
                        />
                    ) : null
                }
            />
        </div>
    );
}

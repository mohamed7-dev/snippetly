import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { SectionLoader } from '@/components/feedback/section-loader';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeveloperActionsDropdown } from '@/features/developer-actions/components/developer-actions-dropdown';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import type { ApiSuccess } from '@/lib/api-client';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import {
    currentUserInboxListDto,
    currentUserOutboxListDto,
    type CurrentUserInboxListDtoType,
} from '@snippetly/common/dto';
import { useQuery, useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ClockIcon, MailIcon, UserPlusIcon } from 'lucide-react';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
    listCurrentUserInboxQueryOptions,
    listCurrentUserOutboxQueryOptions,
} from '../../lib/friendships-listing-query-options';

export function RequestsPageTabs() {
    const { tab } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/requests/',
    });
    const navigate = useNavigate();

    const { data } = useQuery(getCurrentDeveloperActivityStats());
    const stats = data ?? { friendsInboxCount: 0, friendsOutboxCount: 0 };

    const getNameFallback = (
        developer: ApiSuccess<CurrentUserInboxListDtoType['output']>['items'][number]['requester'],
    ) => {
        return formatDeveloperInfo(developer).initials;
    };
    const getFullName = (
        developer: ApiSuccess<CurrentUserInboxListDtoType['output']>['items'][number]['requester'],
    ) => {
        return formatDeveloperInfo(developer).fullName;
    };
    return (
        <Tabs defaultValue="incoming" value={tab}>
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
                        <InboxTabContent getFullName={getFullName} getNameFallback={getNameFallback} />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <OutboxTabContent getFullName={getFullName} getNameFallback={getNameFallback} />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

interface TabContentProps {
    getNameFallback: (
        developer: ApiSuccess<CurrentUserInboxListDtoType['output']>['items'][number]['requester'],
    ) => string;
    getFullName: (
        developer: ApiSuccess<CurrentUserInboxListDtoType['output']>['items'][number]['requester'],
    ) => string;
}

function InboxTabContent({ getNameFallback, getFullName }: TabContentProps) {
    const { incoming } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/requests/',
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
        <React.Fragment>
            <div className="flex items-center gap-4 my-6">
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
                            <div className="flex items-center gap-2 relative pt-6">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={request.requester.image || '/placeholder.svg'}
                                        alt={getNameFallback(request.requester)}
                                    />
                                    <AvatarFallback>{getNameFallback(request.requester)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={`/profile/$id`}
                                            params={{ id: request.requester.id }}
                                            className="font-semibold hover:text-primary"
                                        >
                                            {getFullName(request.requester)}
                                        </Link>
                                        <div className="absolute top-0 right-0 flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                Sent {new Date(request.createdAt)?.toLocaleDateString()}
                                            </Badge>
                                            <DeveloperActionsDropdown
                                                developer={request.requester}
                                                friendshipInfo={{
                                                    isFriendWithCurrentUser: false,
                                                    friendshipStatus: request.status,
                                                }}
                                                favouriteInfo={{
                                                    isFavouritedByCurrentUser:
                                                        request.requester.isFavouritedByCurrentUser,
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
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <p className="text-sm text-muted-foreground mt-1">{request.requester.bio}</p>
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
                        <div className="text-center py-12">
                            <MailIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Incoming Requests</h3>
                            <p className="text-muted-foreground mb-4">
                                You don't have any pending friend requests at the moment.
                            </p>
                            <Button asChild>
                                <Link to="/discover">
                                    <UserPlusIcon className="h-4 w-4 mr-2" />
                                    Discover Developers
                                </Link>
                            </Button>
                        </div>
                    ) : null
                }
            />
        </React.Fragment>
    );
}

export function OutboxTabContent({ getNameFallback, getFullName }: TabContentProps) {
    const { sent } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/requests/',
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
        <React.Fragment>
            <div className="flex items-center gap-4 my-6">
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
                            <div className="flex items-center gap-2 relative pt-6">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={request.addressee.image || '/placeholder.svg'}
                                        alt={getNameFallback(request.addressee)}
                                    />
                                    <AvatarFallback>{getNameFallback(request.addressee)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={`/profile/$id`}
                                            params={{ id: request.addressee.id }}
                                            className="font-semibold hover:text-primary"
                                        >
                                            {getFullName(request.addressee)}
                                        </Link>
                                        <div className="absolute top-0 right-0 flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                Sent {new Date(request.createdAt)?.toLocaleDateString()}
                                            </Badge>
                                            <DeveloperActionsDropdown
                                                developer={request.addressee}
                                                friendshipInfo={{
                                                    isFriendWithCurrentUser: false,
                                                    friendshipStatus: request.status,
                                                }}
                                                favouriteInfo={{
                                                    isFavouritedByCurrentUser:
                                                        request.addressee.isFavouritedByCurrentUser,
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
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <p className="text-sm text-muted-foreground mt-1">{request.addressee.bio}</p>
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
                    !outboxFriendships.length ? (
                        <div className="text-center py-12">
                            <ClockIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Sent Requests</h3>
                            <p className="text-muted-foreground mb-4">
                                You haven't sent any friend requests recently.
                            </p>
                            <Button asChild>
                                <Link to="/discover">
                                    <UserPlusIcon className="h-4 w-4 mr-2" />
                                    Find People to Connect
                                </Link>
                            </Button>
                        </div>
                    ) : null
                }
            />
        </React.Fragment>
    );
}

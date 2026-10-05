import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { SectionLoader } from '@/components/feedback/section-loader';
import { LoadingButton } from '@/components/inputs/loading-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAcceptFriendshipRequest } from '@/features/friendship/hooks/use-accept-friendship-request';
import { useCancelFriendshipRequest } from '@/features/friendship/hooks/use-cancel-friendship-request';
import { useRejectFriendshipRequest } from '@/features/friendship/hooks/use-reject-friendship-request';
import type { ApiSuccess } from '@/lib/api-client';
import type { CurrentUserInboxListDtoType } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CheckIcon, ClockIcon, MailIcon, UserPlusIcon, XIcon } from 'lucide-react';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
    listCurrentUserInboxQueryOptions,
    listCurrentUserOutboxQueryOptions,
} from '../../lib/friendships-listing-query-options';

export function RequestsPageTabs() {
    const { user } = useAuth();
    const stats = user?.stats ?? { friendsInboxCount: 0, friendsOutboxCount: 0 };
    const getNameFallback = (
        developer: ApiSuccess<CurrentUserInboxListDtoType['output']>['items'][number]['requester'],
    ) => {
        return developer.firstName.slice(0, 1) + ' ' + developer.lastName.slice(0, 1);
    };
    const getFullName = (
        developer: ApiSuccess<CurrentUserInboxListDtoType['output']>['items'][number]['requester'],
    ) => {
        return developer.firstName + ' ' + developer.lastName;
    };
    return (
        <Tabs defaultValue="incoming">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="incoming">Incoming ({stats.friendsInboxCount})</TabsTrigger>
                <TabsTrigger value="sent">Sent ({stats.friendsOutboxCount})</TabsTrigger>
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
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserInboxQueryOptions(),
    );
    const inboxFriendships = data.pages?.flatMap(p => p.items) ?? [];

    const qClient = useQueryClient();

    const { mutateAsync: acceptRequest, isPending: isAccepting } = useAcceptFriendshipRequest({
        onSuccess: () => {
            qClient.invalidateQueries(listCurrentUserInboxQueryOptions());
        },
    });

    const { mutateAsync: rejectRequest, isPending: isRejecting } = useRejectFriendshipRequest({
        onSuccess: () => {
            qClient.invalidateQueries(listCurrentUserInboxQueryOptions());
        },
    });

    return (
        <React.Fragment>
            <div className="space-y-4">
                {inboxFriendships.map(request => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="space-y-4 p-3">
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
                                        <Badge variant="secondary" className="text-xs absolute top-0 right-0">
                                            Sent {new Date(request.createdAt)?.toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <p className="text-sm text-muted-foreground mt-1">{request.requester.bio}</p>

                                <div className="flex gap-2 flex-wrap">
                                    <LoadingButton
                                        isLoading={isAccepting}
                                        size="sm"
                                        onClick={() => acceptRequest({ friendId: request.requester.id })}
                                        disabled={isAccepting}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckIcon className="h-4 w-4 sm:mr-1" />
                                        Accept
                                    </LoadingButton>
                                    <LoadingButton
                                        isLoading={isRejecting}
                                        disabled={isRejecting}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => rejectRequest({ friendId: request.requester.id })}
                                    >
                                        <XIcon className="h-4 w-4 sm:mr-1" />
                                        Decline
                                    </LoadingButton>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link to={'/profile/$id'} params={{ id: request.requester.id }}>
                                            View
                                        </Link>
                                    </Button>
                                </div>
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
                                <Link to="/dashboard/discover">
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
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserOutboxQueryOptions(),
    );
    const outboxFriendships = data.pages?.flatMap(p => p.items) ?? [];

    const qClient = useQueryClient();
    const { mutateAsync: cancelRequest, isPending: isCancelling } = useCancelFriendshipRequest({
        onSuccess: () => {
            qClient.invalidateQueries(listCurrentUserOutboxQueryOptions());
        },
    });

    return (
        <React.Fragment>
            <div className="space-y-4">
                {outboxFriendships.map(request => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="space-y-4">
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
                                        <Badge variant="secondary" className="text-xs absolute top-0 right-0">
                                            Sent {new Date(request.createdAt)?.toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <p className="text-sm text-muted-foreground mt-1">{request.addressee.bio}</p>
                                <div className="flex gap-2">
                                    <LoadingButton
                                        isLoading={isCancelling}
                                        size="sm"
                                        variant="destructive-outline"
                                        disabled={isCancelling}
                                        onClick={() => cancelRequest({ friendId: request.addressee.id })}
                                    >
                                        <XIcon className="h-4 w-4 mr-1" />
                                        Cancel Request
                                    </LoadingButton>
                                    <Link to={`/profile/$id`} params={{ id: request.addressee.id }}>
                                        <Button size="sm" variant="ghost">
                                            View Profile
                                        </Button>
                                    </Link>
                                </div>
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
                                <Link to="/dashboard/discover">
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

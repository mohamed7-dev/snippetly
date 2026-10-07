import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { CurrentUserFriendsSnippets } from '@/features/snippet-listing/components/sections/current-user-friends-snippets';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { omit } from '@snippetly/common/lib';
import { useQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { EyeIcon, MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { listCurrentUserFriendsQueryOptions } from '../../lib/friendships-listing-query-options';

export function FriendsPageTabs() {
    const { tab, friendId } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/friends/',
    });
    const navigate = useNavigate();

    const { data } = useQuery(getCurrentDeveloperActivityStats());
    return (
        <Tabs defaultValue="friends" value={tab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                    value="friends"
                    onClick={() => navigate({ to: '.', search: { tab: 'friends' } })}
                >
                    My Friends ({data?.friendsCount ?? 0})
                </TabsTrigger>
                <TabsTrigger
                    value="snippets"
                    onClick={() => navigate({ to: '.', search: { tab: 'snippets' } })}
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
                                navigate({ to: '.', search: { friendId: '', tab: 'snippets' } })
                            }
                        />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

function FriendsTabContent() {
    const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserFriendsQueryOptions(),
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

    const getNameFallback = (developer: { firstName: string; lastName: string }) => {
        return developer.firstName.slice(0, 1) + ' ' + developer.lastName.slice(0, 1);
    };
    const getFullName = (developer: { firstName: string; lastName: string }) => {
        return developer.firstName + ' ' + developer.lastName;
    };

    return (
        <React.Fragment>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friendships.map(item => (
                    <Card key={item.id} className="border-border hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={item.friend.image || '/placeholder.svg'}
                                            alt={getNameFallback(item.friend)}
                                        />
                                        <AvatarFallback>{getNameFallback(item.friend)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-heading hover:text-primary">
                                            <Link to="/profile/$id" params={{ id: item.friend.id }}>
                                                {getFullName(item.friend)}
                                            </Link>
                                        </CardTitle>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreHorizontalIcon className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Button variant={'ghost'} asChild>
                                                <Link to="/profile/$id" params={{ id: item.friend.id }}>
                                                    <EyeIcon className="mr-2 h-4 w-4" />
                                                    View Profile
                                                </Link>
                                            </Button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <p className="text-sm text-muted-foreground text-pretty">{item.friend.bio}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-lg font-semibold">{item.friend.snippetsCount}</p>
                                    <p className="text-xs text-muted-foreground">Snippets</p>
                                </div>
                            </div>

                            {!!item.friend.recentSnippets?.length && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Recent Snippets
                                    </p>
                                    {item.friend.recentSnippets?.map(snippet => (
                                        <div
                                            key={snippet.id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="truncate flex-1">{snippet.name}</span>
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
                                    <Link to="." search={{ tab: 'snippets', friendId: item.friend.id }}>
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

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
import { DiscoverCollectionsList } from '@/features/collection-listing/components/sections/discover-collections-list';
import { DeveloperActionsDropdown } from '@/features/developer-actions/components/developer-actions-dropdown';
import { DiscoverSnippetsList } from '@/features/snippet-listing/components/sections/discover-snippets-list';
import type { ApiSuccess } from '@/lib/api-client';
import {
    developerListDto,
    type DeveloperListDtoType,
    type SendFriendshipRequestDtoType,
} from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { discoverDevelopersQueryOptions } from '../../lib/discover-query-options';

export function DiscoverPageTabs() {
    const { tab } =
        useSearch({
            from: '/(public)/discover/',
        }) ?? {};

    const navigate = useNavigate();
    return (
        <Tabs defaultValue="developers" value={tab}>
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                    value="developers"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'developers' }) })}
                    className="text-xs sm:text-sm font-bold sm:font-semibold"
                >
                    Developers
                </TabsTrigger>
                <TabsTrigger
                    value="snippets"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'snippets' }) })}
                    className="text-xs sm:text-sm font-bold sm:font-semibold"
                >
                    Trending Snippets
                </TabsTrigger>
                <TabsTrigger
                    value="collections"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'collections' }) })}
                    className="text-xs sm:text-sm font-bold sm:font-semibold"
                >
                    Collections
                </TabsTrigger>
            </TabsList>

            <TabsContent value="developers" className="space-y-4 mt-6">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <DevelopersTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
            <TabsContent value="snippets" className="space-y-4 mt-6">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <DiscoverSnippetsList />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="collections" className="space-y-4 mt-6">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <DiscoverCollectionsList />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

function DevelopersTabContent() {
    const qClient = useQueryClient();
    const { developers: developersSearch } =
        useSearch({
            from: '/(public)/discover/',
        }) ?? {};
    const { sort, filter, filterOperator } = developersSearch ?? {};
    const queryKeys = [sort, filter, filterOperator];
    const navigate = useNavigate();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        discoverDevelopersQueryOptions({ sort, filter, filterOperator }, queryKeys),
    );
    const developers = data.pages?.flatMap(p => p.items) ?? [];

    const onSendingFriendshipRequestSuccess = (data: ApiSuccess<SendFriendshipRequestDtoType['output']>) => {
        qClient.setQueriesData<InfiniteData<ApiSuccess<DeveloperListDtoType['output']>>>(
            { queryKey: discoverDevelopersQueryOptions().queryKey },
            old => {
                if (!old) return;

                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        items: page.items.map(item => {
                            if (item.id === data.addressee.id) {
                                return {
                                    ...item,
                                    relationshipWithCurrentUser: {
                                        ...item.relationshipWithCurrentUser,
                                        friendshipInfo: {
                                            isFriendWithCurrentUser: false,
                                            friendshipStatus: data.status,
                                        },
                                    },
                                };
                            }
                            return item;
                        }),
                    })),
                };
            },
        );
    };

    const onFavRes = (developerId: string, favAction: 'add' | 'remove', branch: 'success' | 'error') => {
        qClient.setQueriesData<InfiniteData<ApiSuccess<DeveloperListDtoType['output']>>>(
            { queryKey: discoverDevelopersQueryOptions().queryKey },
            old => {
                if (!old) return;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        items: page.items.map(item => {
                            if (developerId === item.id) {
                                return {
                                    ...item,
                                    relationshipWithCurrentUser: {
                                        ...item.relationshipWithCurrentUser,
                                        isFavouritedByCurrentUser:
                                            favAction === 'add'
                                                ? branch === 'success'
                                                    ? true
                                                    : false
                                                : branch === 'success'
                                                  ? false
                                                  : true,
                                    },
                                };
                            }
                            return item;
                        }),
                    })),
                };
            },
        );
    };

    return (
        <React.Fragment>
            <div className="flex items-center gap-2">
                <FilterQueryDialog
                    schema={developerListDto.input.shape.filter}
                    value={{ filter }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({ ...prev, developers: { ...prev?.developers, ...val } }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={developerListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({
                                ...prev,
                                developers: { ...prev?.developers, sort: val.sort },
                            }),
                        })
                    }
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {developers.map(developer => {
                    const { relationshipWithCurrentUser, activity } = developer;
                    return (
                        <Card key={developer.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <DeveloperIdentity developerInfo={developer} />
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            joined {new Date(developer.createdAt).toLocaleDateString()}
                                        </Badge>
                                        <DeveloperActionsDropdown
                                            developer={developer}
                                            friendshipInfo={relationshipWithCurrentUser.friendshipInfo}
                                            favouriteInfo={{
                                                isFavouritedByCurrentUser:
                                                    relationshipWithCurrentUser.isFavouritedByCurrentUser,
                                            }}
                                            showRequestFriendship={true}
                                            showViewProfile={true}
                                            showAddToFavourites={true}
                                            showRemoveFromFavourites={true}
                                            sendFriendshipRequest={{
                                                onSuccess: onSendingFriendshipRequestSuccess,
                                            }}
                                            addDeveloperToFavourites={{
                                                onSuccess: () => onFavRes(developer.id, 'add', 'success'),
                                                onError: () => onFavRes(developer.id, 'add', 'error'),
                                            }}
                                            removeDeveloperFromFavourites={{
                                                onSuccess: () => onFavRes(developer.id, 'remove', 'success'),
                                                onError: () => onFavRes(developer.id, 'remove', 'error'),
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">{developer.bio}</p>

                                <div className="flex gap-4 text-sm capitalize">
                                    <span>
                                        <strong>{activity.snippetsCount}</strong> snippet
                                        {activity.snippetsCount !== 1 ? 's' : ''}
                                    </span>
                                    <span>
                                        <strong>{activity.collectionsCount}</strong> collection
                                        {activity.collectionsCount !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {activity.tags?.map(tag => (
                                        <Button key={tag.id} variant="link" asChild>
                                            <Link to={'/search'} search={{ tags: [tag.value] }}>
                                                #{tag.value}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !developers.length ? (
                        <StatusCard variant="empty" title="No developers found" layout="section" />
                    ) : null
                }
            />
        </React.Fragment>
    );
}

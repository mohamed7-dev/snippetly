import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscoverCollectionsList } from '@/features/collection-listing/components/sections/discover-collections-list';
import { DiscoverSnippetsList } from '@/features/snippet-listing/components/sections/discover-snippets-list';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { discoverDevelopersQueryOptions } from '../../lib/discover-query-options';

export function DiscoverPageTabs() {
    const { tab } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/discover/',
    });

    const navigate = useNavigate();
    return (
        <Tabs defaultValue="developers" value={tab}>
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                    value="developers"
                    onClick={() => navigate({ to: '.', search: { tab: 'developers' } })}
                    className="text-xs sm:text-sm font-bold sm:font-semibold"
                >
                    Developers
                </TabsTrigger>
                <TabsTrigger
                    value="snippets"
                    onClick={() => navigate({ to: '.', search: { tab: 'snippets' } })}
                    className="text-xs sm:text-sm font-bold sm:font-semibold"
                >
                    Trending Snippets
                </TabsTrigger>
                <TabsTrigger
                    value="collections"
                    onClick={() => navigate({ to: '.', search: { tab: 'collections' } })}
                    className="text-xs sm:text-sm font-bold sm:font-semibold"
                >
                    Collections
                </TabsTrigger>
            </TabsList>

            <TabsContent value="developers" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <DevelopersTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
            <TabsContent value="snippets" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <DiscoverSnippetsList />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
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
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        discoverDevelopersQueryOptions(),
    );
    const developers = data.pages?.flatMap(p => p.items) ?? [];

    const getNameFallback = (developer: { firstName: string; lastName: string }) => {
        return developer.firstName.slice(0, 1) + ' ' + developer.lastName.slice(0, 1);
    };
    const getFullName = (developer: { firstName: string; lastName: string }) => {
        return developer.firstName + ' ' + developer.lastName;
    };

    return (
        <React.Fragment>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {developers.map(developer => (
                    <Card key={developer.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={developer.image || '/placeholder.svg'}
                                            alt={getNameFallback(developer)}
                                        />
                                        <AvatarFallback>{getNameFallback(developer)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Link
                                            to={'/profile/$id'}
                                            params={{ id: developer.id }}
                                            className="font-semibold hover:text-primary"
                                        >
                                            {getFullName(developer)}
                                        </Link>
                                    </div>
                                </div>
                                <Badge variant="secondary">
                                    joined {new Date(developer.createdAt).toLocaleDateString()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">{developer.bio}</p>

                            <div className="flex gap-4 text-sm capitalize">
                                <span>
                                    <strong>{developer.snippetsCount}</strong> snippet
                                    {developer.snippetsCount !== 1 ? 's' : ''}
                                </span>
                                <span>
                                    <strong>{developer.collectionsCount}</strong> collection
                                    {developer.collectionsCount !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {developer.tags?.map(tag => (
                                    <Badge key={tag.id} variant="secondary" className="text-xs">
                                        {tag.value}
                                    </Badge>
                                ))}
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
                    !developers.length ? (
                        <StatusCard variant="empty" title="No developers found" layout="section" />
                    ) : null
                }
            />
        </React.Fragment>
    );
}

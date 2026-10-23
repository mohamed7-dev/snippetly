import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PublicProfilePageCollectionsList } from '@/features/collection-listing/components/sections/public-profile-page-collections-list';
import { PublicProfilePageSnippetsList } from '@/features/snippet-listing/components/sections/public-profile-page-snippets-list';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { getDeveloperProfileQueryOptions } from '../../lib/public-profile-query-options';

export function ProfilePageTabs() {
    const { id } = useParams({ from: '/(public)/developers/$id/' });
    const { data } = useSuspenseQuery(getDeveloperProfileQueryOptions(id));
    const stats =
        'stats' in data.activity
            ? data.activity.stats
            : {
                  snippetsCount: 0,
                  collectionsCount: 0,
                  friendsCount: 0,
                  forkedSnippetsCount: 0,
                  forkedCollectionsCount: 0,
              };

    const { tab } = useSearch({ from: '/(public)/developers/$id/' }) ?? {};
    const navigate = useNavigate();

    return (
        <Tabs defaultValue="snippets" value={tab} className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger
                    value="snippets"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'snippets' }) })}
                >
                    Snippets ({stats.snippetsCount})
                </TabsTrigger>
                <TabsTrigger
                    value="collections"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'collections' }) })}
                >
                    Collections ({stats.collectionsCount})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="snippets">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <PublicProfilePageSnippetsList />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="collections">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <PublicProfilePageCollectionsList />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

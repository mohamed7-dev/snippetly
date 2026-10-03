import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { getDeveloperProfileQueryOptions } from '../../lib/public-profile-query-options';
import { CollectionsTabContent } from './collections-tab-content';
import { SnippetsTabContent } from './snippets-tab-content';

export function ProfilePageTabs() {
    const { id } = useParams({ from: '/(public)/profile/$id' });
    const { data } = useSuspenseQuery(getDeveloperProfileQueryOptions(id));
    const stats =
        'stats' in data
            ? data.stats
            : {
                  snippetsCount: 0,
                  collectionsCount: 0,
                  friendsCount: 0,
                  forkedSnippetsCount: 0,
                  forkedCollectionsCount: 0,
              };

    const { tab } = useSearch({ from: '/(public)/profile/$id' });
    const navigate = useNavigate();
    return (
        <Tabs defaultValue="snippets" value={tab}>
            <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger
                    value="snippets"
                    onClick={() => navigate({ to: '.', search: { tab: 'snippets' } })}
                >
                    Snippets ({stats.snippetsCount})
                </TabsTrigger>
                <TabsTrigger
                    value="collections"
                    onClick={() => navigate({ to: '.', search: { tab: 'collections' } })}
                >
                    Collections ({stats.collectionsCount})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="snippets" className="space-y-4 mt-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <SnippetsTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="collections" className="space-y-4 mt-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <CollectionsTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

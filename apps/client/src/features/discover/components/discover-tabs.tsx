import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLoader } from '@/components/views/page-loading-view';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { CollectionsTabContent } from './collections-tab-content';
import { SnippetsTabContent } from './snippets-tab-content';
import { UsersTabContent } from './users-tab-content';

export function DiscoverTabs() {
    const { tab } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_error-boundary/discover',
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
                    <React.Suspense fallback={<PageLoader />}>
                        <UsersTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
            <TabsContent value="snippets" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<PageLoader />}>
                        <SnippetsTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<PageLoader />}>
                        <CollectionsTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

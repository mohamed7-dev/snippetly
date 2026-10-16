import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { TrashCollectionList } from '../trash-collections-list';
import { TrashSnippetsList } from '../trash-snippets-list';

export function TrashPageContentTabs() {
    const search = useSearch({ from: '/(protected)/dashboard/_dashboard-layout/_boundary/trash/' });
    const { tab } = search ?? {};
    const navigate = useNavigate();
    return (
        <Tabs defaultValue="snippets" value={tab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                    value="snippets"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'snippets' }) })}
                >
                    Snippets
                </TabsTrigger>
                <TabsTrigger
                    value="collections"
                    onClick={() => navigate({ to: '.', search: prev => ({ ...prev, tab: 'collections' }) })}
                >
                    Collections
                </TabsTrigger>
            </TabsList>

            <TabsContent value="snippets" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <TrashSnippetsList />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<SectionLoader />}>
                        <TrashCollectionList />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLoader } from '@/components/views/page-loading-view';
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { InboxTabContent } from './inbox-tab-content';
import { OutboxTabContent } from './outbox-tab-content';

export function TabsSection() {
    const { data } = useSuspenseQuery(getCurrentUserDashboardOptions);
    const stats = data.data.stats;
    return (
        <Tabs defaultValue="incoming">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="incoming">Incoming ({stats.friendsInboxCount})</TabsTrigger>
                <TabsTrigger value="sent">Sent ({stats.friendsOutboxCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<PageLoader />}>
                        <InboxTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
                <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                    <React.Suspense fallback={<PageLoader />}>
                        <OutboxTabContent />
                    </React.Suspense>
                </ErrorBoundary>
            </TabsContent>
        </Tabs>
    );
}

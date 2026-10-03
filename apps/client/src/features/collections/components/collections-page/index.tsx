import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { PageLoader } from '@/components/views/page-loading-view';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { CollectionsGridSection } from './collections-grid-section';
import { MainContentHeader } from './main-content-header';
import { StatsSection } from './stats-section';

export function CollectionsPage() {
    return (
        <div className="p-0 lg:p-6">
            <MainContentHeader />
            <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                <React.Suspense fallback={<PageLoader />}>
                    <StatsSection />
                    <CollectionsGridSection />
                </React.Suspense>
            </ErrorBoundary>
        </div>
    );
}

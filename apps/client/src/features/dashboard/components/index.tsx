import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { PageLoader } from '@/components/views/page-loading-view';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MainContentHeader } from './main-content-header';
import { SnippetsSection } from './snippets-section';
import { StatsSection } from './stats-section';

export function DashboardPage() {
    return (
        <React.Fragment>
            <div className="mb-6">
                <MainContentHeader />
                <StatsSection />
            </div>
            <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                <React.Suspense fallback={<PageLoader />}>
                    <SnippetsSection />
                </React.Suspense>
            </ErrorBoundary>
        </React.Fragment>
    );
}

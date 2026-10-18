import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback';
import { SectionLoader } from '@/components/feedback/section-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FavouriteCollectionsList, FavouriteDevelopersList, FavouriteSnippetsList } from '../favourites-list';

export function FavouritesPageTabs() {
    const { tab = 'snippets' } =
        useSearch({
            from: '/(protected)/dashboard/_dashboard-layout/favourites/',
        }) ?? {};

    const navigate = useNavigate();
    const tabs = [
        { value: 'snippets', label: 'Snippets', content: <FavouriteSnippetsList /> },
        { value: 'collections', label: 'Collections', content: <FavouriteCollectionsList /> },
        { value: 'developers', label: 'Developers', content: <FavouriteDevelopersList /> },
    ] as const;

    return (
        <Tabs value={tab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
                {tabs.map(({ value, label }) => (
                    <TabsTrigger
                        key={value}
                        value={value}
                        onClick={() =>
                            navigate({ to: '.', search: previous => ({ ...previous, tab: value }) })
                        }
                    >
                        {label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map(({ value, content }) => (
                <TabsContent key={value} value={value} className="space-y-4">
                    <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                        <React.Suspense fallback={<SectionLoader />}>{content}</React.Suspense>
                    </ErrorBoundary>
                </TabsContent>
            ))}
        </Tabs>
    );
}

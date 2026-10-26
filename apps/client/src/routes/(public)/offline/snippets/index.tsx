import { GoToButton } from '@/components/inputs/goto-button';
import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem, PageActionBarMenuItem } from '@/components/layout/page-action-bar';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { OfflineSnippetsListing } from '@/features/offline-snippet/components/sections/offline-snippets-listing';
import type { OfflineSnippetsSearchParams } from '@/features/offline-snippet/lib/offline-snippets-search';
import { offlineSnippetsSearchSchema } from '@/features/offline-snippet/lib/offline-snippets-search';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/(public)/offline/snippets/')({
    component: OfflineSnippetsPage,
    validateSearch: offlineSnippetsSearchSchema,
});

function OfflineSnippetsPage() {
    const navigate = Route.useNavigate();
    const searchParams = Route.useSearch();
    const [counts, setCounts] = React.useState<{ filtered: number; total: number }>();
    const updateSearchParams = React.useCallback(
        (updates: Partial<OfflineSnippetsSearchParams>) => {
            void navigate({
                search: previous => ({ ...previous, ...updates }),
                replace: true,
            });
        },
        [navigate],
    );

    return (
        <main>
            <Page className="container mx-auto max-w-6xl px-3 py-8 md:px-6">
                <PageTitle>Offline snippets</PageTitle>
                <PageDescription>
                    {counts
                        ? `${counts.filtered} of ${counts.total} saved snippets`
                        : 'Loading saved snippets...'}
                </PageDescription>
                <PageActionBar>
                    <PageActionBarItem hideOnSmallScreens>
                        <GoToButton label="Offline library" to="/offline" />
                    </PageActionBarItem>
                    <PageActionBarMenuItem>
                        <DropdownMenuItem asChild>
                            <GoToButton
                                label="Offline library"
                                to="/offline"
                                variant={'ghost'}
                                className="justify-start w-full"
                            />
                        </DropdownMenuItem>
                    </PageActionBarMenuItem>
                </PageActionBar>

                <OfflineSnippetsListing
                    searchParams={searchParams}
                    onSearchParamsChange={updateSearchParams}
                    onCountsChange={setCounts}
                />
            </Page>
        </main>
    );
}

import { GoToButton } from '@/components/inputs/goto-button';
import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem, PageActionBarMenuItem } from '@/components/layout/page-action-bar';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { OfflineCollectionsList } from '@/features/offline-snippet/components/sections/offline-collections-list';
import type { OfflineCollectionsSearchParams } from '@/features/offline-snippet/lib/offline-snippets-search';
import { offlineCollectionsSearchSchema } from '@/features/offline-snippet/lib/offline-snippets-search';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/(public)/offline/collections/')({
    component: OfflineCollectionsPage,
    validateSearch: offlineCollectionsSearchSchema,
});

function OfflineCollectionsPage() {
    const navigate = Route.useNavigate();
    const searchParams = Route.useSearch();
    const [counts, setCounts] = React.useState<{ filtered: number; total: number }>();
    const updateSearchParams = React.useCallback(
        (updates: Partial<OfflineCollectionsSearchParams>) => {
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
                <PageTitle>Offline collections</PageTitle>
                <PageDescription>
                    {counts
                        ? `${counts.filtered} of ${counts.total} saved collections`
                        : 'Loading saved collections...'}
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
                                className="w-full justify-start"
                            />
                        </DropdownMenuItem>
                    </PageActionBarMenuItem>
                </PageActionBar>

                <OfflineCollectionsList
                    search={searchParams.search ?? ''}
                    onSearchChange={search =>
                        updateSearchParams({ search: search || undefined })
                    }
                    onCountsChange={setCounts}
                />
            </Page>
        </main>
    );
}

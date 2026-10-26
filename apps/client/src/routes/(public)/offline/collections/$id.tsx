import { GoToButton } from '@/components/inputs/goto-button';
import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem, PageActionBarMenuItem } from '@/components/layout/page-action-bar';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { OfflineCollectionPageContent } from '@/features/offline-snippet/components/sections/offline-collection-page-content';
import type { OfflineCollectionSearchParams } from '@/features/offline-snippet/lib/offline-snippets-search';
import { offlineCollectionSearchSchema } from '@/features/offline-snippet/lib/offline-snippets-search';
import { getExplicitOfflineCollection, getOfflineOwnerId } from '@/features/offline-snippet/lib/store';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/(public)/offline/collections/$id')({
    component: OfflineCollectionPage,
    validateSearch: offlineCollectionSearchSchema,
    loader: async ({ context: { auth }, params: { id } }) => {
        await auth.waitForAuthResolution();
        return await getExplicitOfflineCollection({
            id,
            savedBy: auth.user?.id ?? getOfflineOwnerId(),
        });
    },
});

function OfflineCollectionPage() {
    const collection = Route.useLoaderData();
    const navigate = Route.useNavigate();
    const searchParams = Route.useSearch();
    const [filteredCount, setFilteredCount] = React.useState<number>();
    const updateSearch = React.useCallback(
        (updates: Partial<OfflineCollectionSearchParams>) => {
            void navigate({
                search: previous => ({ ...previous, ...updates }),
                replace: true,
            });
        },
        [navigate],
    );

    return (
        <main className="container mx-auto max-w-6xl px-3 py-8 md:px-6">
            <Page>
                <PageTitle>{collection?.name ?? 'Offline collection'}</PageTitle>
                {collection && (
                    <PageDescription>
                        {collection.description && <span>{collection.description} · </span>}
                        {filteredCount === undefined
                            ? 'Loading saved snippets...'
                            : `${filteredCount} of ${collection.snippets?.length ?? 0} saved snippets`}
                    </PageDescription>
                )}
                <PageActionBar>
                    <PageActionBarItem hideOnSmallScreens>
                        <GoToButton label="Offline collections" to="/offline/collections" />
                    </PageActionBarItem>
                    <PageActionBarMenuItem>
                        <DropdownMenuItem asChild>
                            <GoToButton
                                label="Offline collections"
                                to="/offline/collections"
                                variant={'ghost'}
                                className="w-full justify-start"
                            />
                        </DropdownMenuItem>
                    </PageActionBarMenuItem>
                </PageActionBar>
                <OfflineCollectionPageContent
                    collection={collection}
                    search={searchParams.search ?? ''}
                    onSearchChange={search => updateSearch({ search: search || undefined })}
                    onFilteredCountChange={setFilteredCount}
                />
            </Page>
        </main>
    );
}

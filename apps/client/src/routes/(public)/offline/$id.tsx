import { GoToButton } from '@/components/inputs/goto-button';
import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PageActionBar, PageActionBarItem, PageActionBarMenuItem } from '@/components/layout/page-action-bar';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { OfflineSnippetPageContent } from '@/features/offline-snippet/components/sections/offline-snippet-page-content';
import { getExplicitOfflineSnippet, getOfflineOwnerId } from '@/features/offline-snippet/lib/store';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/offline/$id')({
    component: OfflineSnippetPage,
    loader: async ({ context: { auth }, params: { id } }) => {
        await auth.waitForAuthResolution();
        return await getExplicitOfflineSnippet({
            id,
            savedBy: auth.user?.id ?? getOfflineOwnerId(),
        });
    },
});

function OfflineSnippetPage() {
    const { id } = Route.useParams();
    const snippet = Route.useLoaderData();
    return (
        <main>
            <Page className="container mx-auto px-3 py-8 md:px-6 max-w-6xl">
                <PageTitle>{snippet?.name ?? 'Offline snippet'}</PageTitle>

                {snippet?.description && <PageDescription>{snippet.description}</PageDescription>}
                <PageActionBar>
                    <PageActionBarItem hideOnSmallScreens>
                        <GoToButton label="Offline snippets" to="/offline/snippets" />
                    </PageActionBarItem>
                    <PageActionBarMenuItem>
                        <DropdownMenuItem asChild>
                            <GoToButton
                                label="Offline snippets"
                                to="/offline/snippets"
                                variant={'ghost'}
                                className="w-full justify-start"
                            />
                        </DropdownMenuItem>
                    </PageActionBarMenuItem>
                </PageActionBar>
                <OfflineSnippetPageContent id={id} snippet={snippet} />
            </Page>
        </main>
    );
}

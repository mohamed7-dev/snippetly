import { Page } from '@/components/layout/page';
import { ProfilePageInfo } from '@/features/public-profile/components/sections/profile-page-info';
import { ProfilePageStats } from '@/features/public-profile/components/sections/profile-page-stats';
import { ProfilePageTabs } from '@/features/public-profile/components/sections/profile-page-tabs';
import { getDeveloperProfileQueryOptions } from '@/features/public-profile/lib/public-profile-query-options';
import { listCreatorSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { collectionListDto, snippetListDto } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

const tabsSchema = z
    .object({
        tab: z.enum(['snippets', 'collections']).default('snippets').catch('snippets'),
        snippets: z.object({
            sort: snippetListDto.input.shape.sort,
            filter: snippetListDto.input.shape.filter,
            filterOperator: snippetListDto.input.shape.filterOperator,
            tags: snippetListDto.input.shape.tags,
        }),
        collections: z.object({
            sort: collectionListDto.input.shape.sort,
            filter: collectionListDto.input.shape.filter,
            filterOperator: collectionListDto.input.shape.filterOperator,
            tags: collectionListDto.input.shape.tags,
        }),
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(public)/developers/$id/')({
    component: ProfilePage,
    validateSearch: tabsSchema,
    head: async ({ params, match }) => {
        const queryClient = match.context.queryClient;
        const data = await queryClient.query({
            ...getDeveloperProfileQueryOptions(params.id),
            staleTime: 'static',
        });
        const { fullName } = formatDeveloperInfo(data);
        return {
            meta: [
                {
                    name: 'description',
                    content: data.bio ?? `${fullName} Profile`,
                },
                {
                    title: fullName,
                },
            ],
        };
    },
    loaderDeps: ({ search: { snippets } = {} }) => ({ ...snippets }),
    loader: async ({ context: { queryClient }, params: { id }, deps }) => {
        void queryClient
            .infiniteQuery({
                ...listCreatorSnippetsQueryOptions(id, deps, Object.values(deps)),
            })
            .catch();
        await queryClient.query({ ...getDeveloperProfileQueryOptions(id), staleTime: 'static' });
    },
});

function ProfilePage() {
    return (
        <main>
            <Page className="container mx-auto flex flex-col gap-6 px-6 py-8">
                <ProfilePageInfo />
                <ProfilePageStats />
                <ProfilePageTabs />
            </Page>
        </main>
    );
}

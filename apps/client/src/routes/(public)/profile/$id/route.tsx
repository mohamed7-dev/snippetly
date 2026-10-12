import { ProfilePageHeader } from '@/features/public-profile/components/sections/profile-page-header';
import { ProfilePageInfo } from '@/features/public-profile/components/sections/profile-page-info';
import { ProfilePageStats } from '@/features/public-profile/components/sections/profile-page-stats';
import { ProfilePageTabs } from '@/features/public-profile/components/sections/profile-page-tabs';
import { getDeveloperProfileQueryOptions } from '@/features/public-profile/lib/public-profile-query-options';
import { listCreatorSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { collectionListDto, snippetListDto } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

const tabsSchema = z.object({
    tab: z.enum(['snippets', 'collections']).default('snippets').catch('snippets'),
    snippets: z
        .object({
            sort: snippetListDto.input.shape.sort.default({}).catch({}),
            filter: snippetListDto.input.shape.filter.default({}).catch({}),
            filterOperator: snippetListDto.input.shape.filterOperator,
            tags: snippetListDto.input.shape.tags.optional(),
        })
        .optional(),
    collections: z
        .object({
            sort: collectionListDto.input.shape.sort.default({}).catch({}),
            filter: collectionListDto.input.shape.filter.default({}).catch({}),
            filterOperator: collectionListDto.input.shape.filterOperator,
            tags: collectionListDto.input.shape.tags.optional(),
        })
        .optional(),
});

export const Route = createFileRoute('/(public)/profile/$id')({
    component: ProfilePage,
    validateSearch: tabsSchema,
    head: async ({ params, match }) => {
        const queryClient = match.context.queryClient;
        const data = await queryClient.query({
            ...getDeveloperProfileQueryOptions(params.id),
            staleTime: 'static',
        });
        const name = data.firstName + ' ' + data.lastName;
        return {
            meta: [
                {
                    name: 'description',
                    content: data.bio ?? `${name} Profile`,
                },
                {
                    title: name,
                },
            ],
        };
    },
    loaderDeps: ({ search: { snippets } }) => ({ ...snippets }),
    loader: async ({ context: { queryClient }, params: { id }, deps }) => {
        await queryClient.infiniteQuery({
            ...listCreatorSnippetsQueryOptions(id, deps, Object.values(deps)),
            staleTime: 'static',
        });
        await queryClient.query({ ...getDeveloperProfileQueryOptions(id), staleTime: 'static' });
    },
});

function ProfilePage() {
    return (
        <div className="min-h-screen">
            <ProfilePageHeader />
            <main className="flex flex-col gap-6 container mx-auto px-6 py-8">
                <ProfilePageInfo />
                <ProfilePageStats />
                <ProfilePageTabs />
            </main>
        </div>
    );
}

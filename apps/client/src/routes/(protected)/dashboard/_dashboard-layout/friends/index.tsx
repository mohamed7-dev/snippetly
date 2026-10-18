import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { FriendsPageMainContentHeader } from '@/features/friendships-listing/components/sections/friends-page-main-content-header';
import { FriendsPageTabs } from '@/features/friendships-listing/components/sections/friends-page-tabs';
import { listCurrentUserFriendsQueryOptions } from '@/features/friendships-listing/lib/friendships-listing-query-options';
import {
    currentUserFriendsListDto,
    idSchema,
    Permission,
    userFriendsSnippetsListDto,
} from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

const searchSchema = z
    .object({
        tab: z.enum(['friends', 'snippets']).default('friends').catch('friends'),
        friends: z
            .object({
                sort: currentUserFriendsListDto.input.shape.sort,
                filter: currentUserFriendsListDto.input.shape.filter,
                filterOperator: currentUserFriendsListDto.input.shape.filterOperator,
            })
            .partial(),
        snippets: z
            .object({
                sort: userFriendsSnippetsListDto.input.shape.sort,
                filter: userFriendsSnippetsListDto.input.shape.filter,
                filterOperator: userFriendsSnippetsListDto.input.shape.filterOperator,
                friendId: idSchema,
                tags: userFriendsSnippetsListDto.input.shape.tags,
            })
            .partial(),
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/friends/')({
    component: FriendsPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Friends',
                },
            ],
        };
    },
    validateSearch: searchSchema,
    loaderDeps: ({ search: { friends } = {} }) => ({ ...friends }),
    loader: async ({ context: { queryClient }, deps }) => {
        await queryClient.infiniteQuery({
            ...listCurrentUserFriendsQueryOptions(deps, Object.values(deps)),
            staleTime: 'static',
        });
    },
});

function FriendsPage() {
    const { user } = useAuth();
    return (
        <div className="space-y-6">
            <FriendsPageMainContentHeader />
            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.ReadFriendship, Permission.Owner]}
                ownerId={user?.id}
            >
                <FriendsPageTabs />
            </PermissionGuard>
        </div>
    );
}

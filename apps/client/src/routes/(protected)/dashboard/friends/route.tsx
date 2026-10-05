import { FriendsPageHeader } from '@/features/friendships-listing/components/sections/friends-page-header';
import { FriendsPageMainContentHeader } from '@/features/friendships-listing/components/sections/friends-page-main-content-header';
import { FriendsPageTabs } from '@/features/friendships-listing/components/sections/friends-page-tabs';
import { listCurrentUserFriendsQueryOptions } from '@/features/friendships-listing/lib/friendships-listing-query-options';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import z from 'zod';

const searchSchema = z.object({
    tab: z.enum(['friends', 'snippets']).default('friends').catch('friends'),
    friendId: z.uuid().optional().catch(''),
});

export const Route = createFileRoute('/(protected)/dashboard/friends')({
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
    loader: ({ context: { queryClient } }) => {
        queryClient.infiniteQuery(listCurrentUserFriendsQueryOptions()).catch();
    },
});

function FriendsPage() {
    return (
        <React.Fragment>
            <FriendsPageHeader />
            <main className="container mx-auto px-3 md:px-6 py-8">
                <FriendsPageMainContentHeader />
                <FriendsPageTabs />
            </main>
        </React.Fragment>
    );
}

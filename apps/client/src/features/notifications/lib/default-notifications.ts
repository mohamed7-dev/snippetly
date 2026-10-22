import { Button } from '@/components/ui/button';
import {
    listPendingOfflineCollections,
    listPendingOfflineCollectionUpdates,
    listPendingOfflineSnippets,
    listPendingOfflineSnippetUpdates,
} from '@/features/offline-snippet/lib/store';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import {
    LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY,
    LOCAL_STORAGE_RECENT_REGISTRATION_AT_KEY,
} from '@/lib/constants';
import type { ListAppNotificationsDtoType } from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { Link } from '@tanstack/react-router';
import { createElement } from 'react';
import { registerNotification } from './notification-registry';
import type { AppNotificationDefinition, NotificationActionContext } from './notification-types';

const RECENT_REGISTRATION_WINDOW_MS = 24 * 60 * 60 * 1000;
const BACKGROUND_SYNC_RECHECK_INTERVAL_MS = 5_000;
export const APP_NOTIFICATIONS_NOTIFICATION_ID = 'app-notifications';
export const APP_NOTIFICATION_PAGE_SIZE = 20;

type AppNotificationsPage = ListAppNotificationsDtoType['output'];

export async function fetchAppNotificationsPage(skip: number): Promise<AppNotificationsPage> {
    const searchParams = transformInputToSearchParams({
        take: APP_NOTIFICATION_PAGE_SIZE,
        skip,
        sort: { createdAt: 'DESC', id: 'DESC' },
    });
    return developerApiClient.fetch<AppNotificationsPage>(apiEndpoints.notifications.list.url(searchParams), {
        method: apiEndpoints.notifications.list.method,
    });
}

type PendingSyncSummary = {
    itemCount: number;
};

type RecentRegistration = {
    registeredAt: number | null;
};

const offlineNotification: AppNotificationDefinition<boolean> = {
    id: 'offline-status',
    title: 'You are offline',
    description: 'Some dashboard sections and actions need an internet connection.',
    severity: 'warning',
    recheckInterval: 15_000,
    check: () => navigator.onLine,
    shouldShow: isOnline => !isOnline,
};

const backgroundSyncNotification: AppNotificationDefinition<PendingSyncSummary> = {
    id: 'background-sync',
    title: 'Syncing your offline changes',
    description: ({ itemCount }) =>
        `${itemCount} ${itemCount === 1 ? 'change is' : 'changes are'} being synced in the background.`,
    severity: 'info',
    recheckInterval: BACKGROUND_SYNC_RECHECK_INTERVAL_MS,
    check: async () => {
        if (!navigator.onLine) return { itemCount: 0 };

        const ownerId = localStorage.getItem(LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY);
        if (!ownerId) return { itemCount: 0 };

        const [collections, snippets, collectionUpdates, snippetUpdates] = await Promise.all([
            listPendingOfflineCollections(ownerId),
            listPendingOfflineSnippets(ownerId),
            listPendingOfflineCollectionUpdates(ownerId),
            listPendingOfflineSnippetUpdates(ownerId),
        ]);

        return {
            itemCount:
                collections.length + snippets.length + collectionUpdates.length + snippetUpdates.length,
        };
    },
    shouldShow: ({ itemCount }) => itemCount > 0,
};

const recentRegistrationNotification: AppNotificationDefinition<RecentRegistration> = {
    id: 'welcome-recent-registration',
    title: 'Welcome to Snippetly!',
    description: 'Your account is ready. Discover snippets shared by the community.',
    severity: 'info',
    recheckInterval: false,
    check: () => {
        const value = localStorage.getItem(LOCAL_STORAGE_RECENT_REGISTRATION_AT_KEY);
        const registeredAt = value === null ? null : Number(value);
        return {
            registeredAt: registeredAt !== null && Number.isFinite(registeredAt) ? registeredAt : null,
        };
    },
    shouldShow: ({ registeredAt }) =>
        registeredAt !== null &&
        Date.now() - registeredAt >= 0 &&
        Date.now() - registeredAt < RECENT_REGISTRATION_WINDOW_MS,
    actions: [
        {
            label: 'Discover snippets',
            component: DiscoverSnippetsAction,
        },
    ],
};

export const appNotificationsNotification: AppNotificationDefinition<AppNotificationsPage> = {
    id: APP_NOTIFICATIONS_NOTIFICATION_ID,
    title: ({ itemsCount }) => `${itemsCount} notifications`,
    description: 'Recent alerts from your Snippetly activity.',
    severity: 'info',
    recheckInterval: false,
    check: () => fetchAppNotificationsPage(0),
    shouldShow: ({ items }) => items.length > 0,
};

function DiscoverSnippetsAction({ dismiss }: NotificationActionContext<unknown>) {
    return createElement(
        Button,
        { asChild: true, size: 'sm', variant: 'secondary' },
        createElement(
            Link,
            {
                to: '/discover',
                onClick: () => {
                    localStorage.removeItem(LOCAL_STORAGE_RECENT_REGISTRATION_AT_KEY);
                    dismiss();
                },
            },
            'Discover snippets',
        ),
    );
}

export function registerDefaultNotifications(): void {
    registerNotification(offlineNotification);
    registerNotification(backgroundSyncNotification);
    registerNotification(recentRegistrationNotification);
    registerNotification(appNotificationsNotification);
}

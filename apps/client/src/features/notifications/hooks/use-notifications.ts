import { useAuth } from '@/features/auth/hooks/use-auth';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { appNotificationsNotification, fetchAppNotificationsPage } from '../lib/default-notifications';
import { useNotificationsContext } from './use-notifications-context';

export type NotificationEntry = {
    definition: ReturnType<typeof useNotificationsContext>['definitions'][number];
    active: boolean;
    severity: 'error' | 'info' | 'warning';
    data: unknown;
    error?: Error;
    href?: string;
    dismiss: () => void;
};

export function useNotifications() {
    const auth = useAuth();
    const queryClient = useQueryClient();
    const { definitions, rawQueryResults, dismissedAlerts, dismissAlert, isEnabled } =
        useNotificationsContext();
    const appNotificationsQuery = useInfiniteQuery({
        queryKey: ['app-notifications', auth.user?.id],
        enabled: isEnabled && auth.isAuthenticated,
        refetchInterval: 30_000,
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
            pageParam === 0 ? appNotificationsNotification.check() : fetchAppNotificationsPage(pageParam),
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.reduce((count, page) => count + page.items.length, 0);
            return loadedCount < lastPage.itemsCount ? loadedCount : undefined;
        },
    });
    useEffect(() => {
        if (appNotificationsQuery.isError) {
            toast.error('Could not load notifications', {
                description:
                    appNotificationsQuery.error instanceof Error
                        ? appNotificationsQuery.error.message
                        : 'Please try again.',
            });
        }
    }, [appNotificationsQuery.error, appNotificationsQuery.isError]);

    const notifications = useMemo(
        () =>
            isEnabled
                ? [
                      ...(appNotificationsQuery.data?.pages.flatMap(page => page.items) ?? []).map(
                          (notification): NotificationEntry => ({
                              definition: {
                                  ...appNotificationsNotification,
                                  id: `app-notification-${notification.id}`,
                                  title: notification.title,
                                  description: notification.body,
                              },
                              active: true,
                              severity: 'info',
                              data: notification,
                              href: notification.url ?? undefined,
                              dismiss: () => {
                                  void developerApiClient
                                      .fetch<{ success: boolean }>(
                                          apiEndpoints.notifications.dismiss.url(notification.id),
                                          { method: apiEndpoints.notifications.dismiss.method },
                                      )
                                      .then(() =>
                                          queryClient.invalidateQueries({ queryKey: ['app-notifications'] }),
                                      )
                                      .catch(error => {
                                          toast.error('Could not dismiss notification', {
                                              description:
                                                  error instanceof Error
                                                      ? error.message
                                                      : 'Please try again.',
                                          });
                                      });
                              },
                          }),
                      ),
                      ...definitions
                          .filter(definition => definition.id !== appNotificationsNotification.id)
                          .flatMap((definition, index): NotificationEntry[] => {
                              const result = rawQueryResults[index];
                              if (!result || (!result.isSuccess && !result.isError)) return [];

                              const isQueryError = result.isError;
                              const active = isQueryError
                                  ? !dismissedAlerts.has(definition.id)
                                  : definition.shouldShow(result.data) && !dismissedAlerts.has(definition.id);

                              return [
                                  {
                                      definition,
                                      active,
                                      severity: isQueryError ? 'error' : definition.severity,
                                      data: result.data,
                                      error: result.error ?? undefined,
                                      dismiss: () => dismissAlert(definition.id),
                                  },
                              ];
                          }),
                  ]
                : [],
        [
            appNotificationsQuery.data,
            auth.user?.id,
            definitions,
            rawQueryResults,
            dismissedAlerts,
            dismissAlert,
            isEnabled,
            queryClient,
        ],
    );

    const activeCount = notifications.filter(notification => notification.active).length;

    return {
        notifications,
        activeCount,
        isEnabled,
        hasMore: appNotificationsQuery.hasNextPage ?? false,
        isLoadingMore: appNotificationsQuery.isFetchingNextPage,
        loadMore: appNotificationsQuery.fetchNextPage,
    };
}

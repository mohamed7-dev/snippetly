import { useDeveloperSettings } from '@/features/developer-settings/hooks/use-developer-settings';
import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { APP_NOTIFICATIONS_NOTIFICATION_ID } from '../lib/default-notifications';
import { listNotifications, subscribeToNotificationRegistry } from '../lib/notification-registry';
import type { AppNotificationDefinition } from '../lib/notification-types';

export type NotificationsContextValue = {
    definitions: AppNotificationDefinition[];
    rawQueryResults: UseQueryResult<unknown, Error>[];
    dismissedAlerts: Map<string, number>;
    dismissAlert: (id: string) => void;
    isEnabled: boolean;
};

export const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const INITIAL_QUERY_DELAY_MS = 5_000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const {
        state: { settings, isLoaded },
    } = useDeveloperSettings();
    const [definitions, setDefinitions] = useState(listNotifications);
    const [dismissedAlerts, setDismissedAlerts] = useState<Map<string, number>>(() => new Map());
    const [isReady, setIsReady] = useState(false);

    useEffect(() => subscribeToNotificationRegistry(() => setDefinitions(listNotifications())), []);

    useEffect(() => {
        const timer = window.setTimeout(() => setIsReady(true), INITIAL_QUERY_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, []);

    const areNotificationsEnabled = isLoaded && settings.inAppNotificationsEnabled;

    const rawQueryResults = useQueries({
        queries: definitions
            .filter(definition => definition.id !== APP_NOTIFICATIONS_NOTIFICATION_ID)
            .map(definition => ({
                queryKey: ['dashboard-notification', definition.id],
                queryFn: () => definition.check(),
                refetchInterval: definition.recheckInterval,
                enabled: isReady && areNotificationsEnabled,
            })),
    });

    const dismissAlert = useCallback((id: string) => {
        setDismissedAlerts(previous => new Map(previous).set(id, Date.now()));
    }, []);

    useEffect(() => {
        setDismissedAlerts(previous => {
            let next = previous;
            definitions
                .filter(definition => definition.id !== APP_NOTIFICATIONS_NOTIFICATION_ID)
                .forEach((definition, index) => {
                    const result = rawQueryResults[index];
                    if (
                        previous.has(definition.id) &&
                        result?.isSuccess &&
                        !definition.shouldShow(result.data)
                    ) {
                        if (next === previous) next = new Map(previous);
                        next.delete(definition.id);
                    }
                });
            return next;
        });
    }, [definitions, rawQueryResults]);

    return (
        <NotificationsContext.Provider
            value={{
                definitions,
                rawQueryResults,
                dismissedAlerts,
                dismissAlert,
                isEnabled: isReady && areNotificationsEnabled,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

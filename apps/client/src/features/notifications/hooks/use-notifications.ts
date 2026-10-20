import { useMemo } from 'react';
import { useNotificationsContext } from './use-notifications-context';

export type NotificationEntry = {
    definition: ReturnType<typeof useNotificationsContext>['definitions'][number];
    active: boolean;
    severity: 'error' | 'info' | 'warning';
    data: unknown;
    error?: Error;
    dismiss: () => void;
};

export function useNotifications() {
    const { definitions, rawQueryResults, dismissedAlerts, dismissAlert, isEnabled } =
        useNotificationsContext();

    const notifications = useMemo(
        () =>
            definitions.flatMap((definition, index): NotificationEntry[] => {
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
        [definitions, rawQueryResults, dismissedAlerts, dismissAlert],
    );

    const activeCount = notifications.filter(notification => notification.active).length;

    return { notifications, activeCount, isEnabled };
}

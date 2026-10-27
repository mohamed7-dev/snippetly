import { describe, expect, it, vi } from 'vitest';
import { getNotification, listNotifications, registerNotification, subscribeToNotificationRegistry } from './notification-registry';
import type { AppNotificationDefinition } from './notification-types';

describe('notification registry', () => {
    it('registers and retrieves typed notification definitions', () => {
        const id = 'notification-registry-number-test';
        const definition: AppNotificationDefinition<number> = {
            id,
            title: count => `${count} pending changes`,
            description: 'Changes are waiting to sync.',
            severity: 'warning',
            recheckInterval: 10_000,
            check: () => 3,
            shouldShow: count => count > 0,
        };

        registerNotification(definition);

        expect(getNotification(id)).toBe(definition);
        expect(listNotifications()).toContain(definition);
    });

    it('notifies subscribers when a definition is registered', () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToNotificationRegistry(listener);

        registerNotification({
            id: 'notification-registry-subscriber-test',
            title: 'Connectivity',
            severity: 'info',
            recheckInterval: false,
            check: () => true,
            shouldShow: () => true,
        });

        expect(listener).toHaveBeenCalledOnce();
        unsubscribe();
    });
});

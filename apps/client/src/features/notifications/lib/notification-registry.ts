import type { AppNotificationDefinition } from './notification-types';

const registry = new Map<string, AppNotificationDefinition>();
const listeners = new Set<() => void>();

export function registerNotification<TResponse>(
    definition: AppNotificationDefinition<TResponse>,
): void {
    const existing = registry.get(definition.id);
    const registeredDefinition = definition as unknown as AppNotificationDefinition;
    if (existing === registeredDefinition) return;

    registry.set(definition.id, registeredDefinition);
    listeners.forEach(listener => listener());
}

export function listNotifications(): AppNotificationDefinition[] {
    return Array.from(registry.values());
}

export function getNotification(id: string): AppNotificationDefinition | undefined {
    return registry.get(id);
}

export function getNotificationRegistry(): Map<string, AppNotificationDefinition> {
    return registry;
}

export function subscribeToNotificationRegistry(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

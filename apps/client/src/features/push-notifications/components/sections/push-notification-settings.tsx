import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useDeveloperSettings } from '@/features/developer-settings/hooks/use-developer-settings';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import {
    type GetPushNotificationPublicKeyDtoType,
    type SavePushNotificationSubscriptionDtoType,
} from '@snippetly/common/dto';
import { useEffect, useState } from 'react';

type PushAvailability = 'checking' | 'available' | 'unsupported';

function decodeApplicationServerKey(value: string): ArrayBuffer {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = atob(padded);
    const key = new ArrayBuffer(decoded.length);
    const bytes = new Uint8Array(key);
    for (let index = 0; index < decoded.length; index++) {
        bytes[index] = decoded.charCodeAt(index);
    }
    return key;
}

export function PushNotificationSettings() {
    const {
        state: { settings, isLoaded },
        actions: { setPushEnabled },
    } = useDeveloperSettings();
    const [availability, setAvailability] = useState<PushAvailability>('checking');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string>();

    useEffect(() => {
        let isMounted = true;
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
            setAvailability('unsupported');
            return;
        }

        void navigator.serviceWorker.ready
            .then(registration => registration.pushManager.getSubscription())
            .then(subscription => {
                if (!isMounted) return;
                setIsSubscribed(subscription !== null);
                setAvailability('available');
            })
            .catch(cause => {
                if (!isMounted) return;
                setError(cause instanceof Error ? cause.message : 'Could not check notification settings.');
                setAvailability('available');
            });

        return () => {
            isMounted = false;
        };
    }, []);

    async function enableNotifications() {
        setError(undefined);
        setIsBusy(true);
        try {
            const permission =
                Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error(
                    permission === 'denied'
                        ? 'Notifications are blocked for this site. Change your browser permission to enable them.'
                        : 'Notification permission was not granted.',
                );
            }

            const publicKey = await developerApiClient.fetch<GetPushNotificationPublicKeyDtoType['output']>(
                apiEndpoints.pushNotifications.publicKey.url,
                {
                    method: apiEndpoints.pushNotifications.publicKey.method,
                },
            );
            if (!publicKey.publicKey) {
                throw new Error('Push notifications are not configured on this server yet.');
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription =
                (await registration.pushManager.getSubscription()) ??
                (await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: decodeApplicationServerKey(publicKey.publicKey),
                }));
            const serializedSubscription = subscription.toJSON();
            if (
                !serializedSubscription.endpoint ||
                !serializedSubscription.keys?.p256dh ||
                !serializedSubscription.keys.auth
            ) {
                throw new Error('The browser returned an incomplete push subscription.');
            }

            const input: SavePushNotificationSubscriptionDtoType['input'] = {
                endpoint: serializedSubscription.endpoint,
                keys: {
                    p256dh: serializedSubscription.keys.p256dh,
                    auth: serializedSubscription.keys.auth,
                },
            };
            await developerApiClient.fetch<{ success: boolean }>(
                apiEndpoints.pushNotifications.subscribe.url,
                {
                    method: apiEndpoints.pushNotifications.subscribe.method,
                    body: JSON.stringify(input),
                },
            );
            setIsSubscribed(true);
            setPushEnabled(true);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not enable push notifications.');
        } finally {
            setIsBusy(false);
        }
    }

    async function disableNotifications() {
        setError(undefined);
        setIsBusy(true);
        setPushEnabled(false);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await developerApiClient.fetch<{ success: boolean }>(
                    apiEndpoints.pushNotifications.unsubscribe.url,
                    {
                        method: apiEndpoints.pushNotifications.unsubscribe.method,
                        body: JSON.stringify({ endpoint: subscription.endpoint }),
                    },
                );
                await subscription.unsubscribe();
            }
            setIsSubscribed(false);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not disable push notifications.');
        } finally {
            setIsBusy(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Push notifications</CardTitle>
                <CardDescription>
                    Allow browser notifications when a friend publishes a public snippet, including when
                    Snippetly is closed. Your browser must grant notification permission.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {availability === 'unsupported' ? (
                    <p className="text-sm text-muted-foreground">
                        Push notifications are not supported by this browser.
                    </p>
                ) : (
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium">Allow push notifications</p>
                            <p className="text-sm text-muted-foreground">
                                {availability === 'checking'
                                    ? 'Checking this device…'
                                    : isBusy
                                      ? 'Updating notification preference…'
                                      : settings.isPushEnabled && isSubscribed
                                        ? 'Push notifications are enabled for your account on this device.'
                                        : settings.isPushEnabled
                                          ? 'Push notifications are enabled for your account, but not subscribed on this device.'
                                          : 'Push notifications are disabled for your account.'}
                            </p>
                        </div>
                        <Switch
                            aria-label="Enable push notifications"
                            checked={settings.isPushEnabled}
                            disabled={!isLoaded || availability !== 'available' || isBusy}
                            onCheckedChange={enabled =>
                                void (enabled ? enableNotifications() : disableNotifications())
                            }
                        />
                    </div>
                )}
                {error && (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

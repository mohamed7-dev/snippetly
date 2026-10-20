import {
    type GetPushNotificationPublicKeyDtoType,
    type SavePushNotificationSubscriptionDtoType,
} from '@snippetly/common/dto';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { apiEndpoints } from '@/lib/api-endpoints';
import { developerApiClient } from '@/lib/api-client';

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
                Notification.permission === 'granted'
                    ? 'granted'
                    : await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error(
                    permission === 'denied'
                        ? 'Notifications are blocked for this site. Change your browser permission to enable them.'
                        : 'Notification permission was not granted.',
                );
            }

            const publicKey = await developerApiClient.fetch<
                GetPushNotificationPublicKeyDtoType['output']
            >(apiEndpoints.pushNotifications.publicKey.url, {
                method: apiEndpoints.pushNotifications.publicKey.method,
            });
            if (!publicKey.publicKey) {
                throw new Error('Push notifications are not configured on this server yet.');
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: decodeApplicationServerKey(publicKey.publicKey),
            });
            const serializedSubscription = subscription.toJSON();
            if (!serializedSubscription.endpoint || !serializedSubscription.keys?.p256dh || !serializedSubscription.keys.auth) {
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
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not enable push notifications.');
        } finally {
            setIsBusy(false);
        }
    }

    async function disableNotifications() {
        setError(undefined);
        setIsBusy(true);
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
                    Get notified when a friend publishes a public snippet, even when Snippetly is closed.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-3">
                {availability === 'unsupported' ? (
                    <p className="text-sm text-muted-foreground">
                        Push notifications are not supported by this browser.
                    </p>
                ) : (
                    <Button
                        type="button"
                        variant={isSubscribed ? 'outline' : 'default'}
                        disabled={availability !== 'available' || isBusy}
                        onClick={() => void (isSubscribed ? disableNotifications() : enableNotifications())}
                    >
                        {availability === 'checking'
                            ? 'Checking…'
                            : isBusy
                              ? 'Please wait…'
                              : isSubscribed
                                ? 'Turn off notifications'
                                : 'Enable notifications'}
                    </Button>
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

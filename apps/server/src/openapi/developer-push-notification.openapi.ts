import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
    deletePushNotificationSubscriptionDto,
    getPushNotificationPublicKeyDto,
    savePushNotificationSubscriptionDto,
} from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperPushNotificationOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'post',
        path: '/developer/push-notifications/subscriptions',
        tag: 'PushNotification',
        summary: 'Subscribe to the push notification service',
        body: savePushNotificationSubscriptionDto.input,
        response: savePushNotificationSubscriptionDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/push-notifications/subscriptions',
        tag: 'PushNotification',
        summary: 'Unsubscribe from the push notification service',
        body: deletePushNotificationSubscriptionDto.input,
        response: deletePushNotificationSubscriptionDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/push-notifications/public-key',
        tag: 'PushNotification',
        summary: 'Get public key of the push notification service',
        response: getPushNotificationPublicKeyDto.output,
        authenticated: false,
    });
}

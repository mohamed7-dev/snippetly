import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { dismissAppNotificationDto, listAppNotificationsDto } from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperNotificationsOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'get',
        path: '/developer/notifications',
        tag: 'Notifications',
        summary: 'List the current developer notifications',
        query: listAppNotificationsDto.input.unwrap(),
        response: listAppNotificationsDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/notifications/{id}',
        tag: 'Notifications',
        summary: 'Dismiss a notification',
        params: dismissAppNotificationDto.input,
        response: dismissAppNotificationDto.output,
        authenticated: true,
    });
}

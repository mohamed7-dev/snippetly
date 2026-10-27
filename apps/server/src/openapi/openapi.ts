import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registerDeveloperAuthOpenApi } from './developer-auth.openapi';
import { registerDeveloperCollectionsOpenApi } from './developer-collections.openapi';
import { registerDeveloperDevelopersOpenApi } from './developer-developers.openapi';
import { registerDeveloperFavouritesOpenApi } from './developer-favourites.openapi';
import { registerDeveloperFriendshipsOpenApi } from './developer-friendships.openapi';
import { registerDeveloperNotificationsOpenApi } from './developer-notifications.openapi';
import { registerDeveloperPreferencesOpenApi } from './developer-preferences.openapi';
import { registerDeveloperPushNotificationOpenApi } from './developer-push-notification.openapi';
import { registerDeveloperSearchOpenApi } from './developer-search.openapi';
import { registerDeveloperSlugsOpenApi } from './developer-slugs.openapi';
import { registerDeveloperSnippetsOpenApi } from './developer-snippets.openapi';
import { registerDeveloperTagsOpenApi } from './developer-tags.openapi';

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
});

registerDeveloperAuthOpenApi(registry);
registerDeveloperCollectionsOpenApi(registry);
registerDeveloperSearchOpenApi(registry);
registerDeveloperSnippetsOpenApi(registry);
registerDeveloperDevelopersOpenApi(registry);
registerDeveloperPreferencesOpenApi(registry);
registerDeveloperNotificationsOpenApi(registry);
registerDeveloperPushNotificationOpenApi(registry);
registerDeveloperFriendshipsOpenApi(registry);
registerDeveloperFavouritesOpenApi(registry);
registerDeveloperTagsOpenApi(registry);
registerDeveloperSlugsOpenApi(registry);

export const openApiDocument: ReturnType<OpenApiGeneratorV3['generateDocument']> = new OpenApiGeneratorV3(
    registry.definitions,
).generateDocument({
    openapi: '3.0.0',
    info: {
        title: 'Snippetly API',
        version: '1.0.0',
        description: 'The Snippetly developer API.',
    },
    servers: [{ url: '/api/v1' }],
});

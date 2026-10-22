import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { getDeveloperPreferencesDto, updateDeveloperPreferencesDto } from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperPreferencesOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'get',
        path: '/developer/preferences/me',
        tag: 'Preferences',
        summary: 'Get the current developer preferences',
        response: getDeveloperPreferencesDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/preferences/me',
        tag: 'Preferences',
        summary: 'Update the current developer preferences',
        body: updateDeveloperPreferencesDto.input,
        response: updateDeveloperPreferencesDto.output,
        authenticated: true,
    });
}

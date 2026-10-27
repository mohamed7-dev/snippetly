import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
    activeDeveloperAccountActivityDto,
    activeDeveloperDto,
    deleteDeveloperAccountDto,
    developerListDto,
    findOneDeveloperDto,
    updateDeveloperAccountDto,
} from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperDevelopersOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'get',
        path: '/developer/developers',
        tag: 'Developers',
        summary: 'List developers',
        query: developerListDto.input,
        response: developerListDto.output,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/developers/me',
        tag: 'Developers',
        summary: 'Get the current developer',
        response: activeDeveloperDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/developers/me/activity',
        tag: 'Developers',
        summary: 'Get current developer activity info',
        response: activeDeveloperAccountActivityDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/developers/{id}',
        tag: 'Developers',
        summary: 'Get a developer',
        params: findOneDeveloperDto.input,
        response: findOneDeveloperDto.output,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/developers/me',
        tag: 'Developers',
        summary: 'Update the current developer',
        body: updateDeveloperAccountDto.input,
        response: updateDeveloperAccountDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/developers/me',
        tag: 'Developers',
        summary: 'Delete the current developer account',
        response: deleteDeveloperAccountDto.output,
        authenticated: true,
    });
}

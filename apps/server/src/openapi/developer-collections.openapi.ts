import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
    collectionListDto,
    createCollectionDto,
    currentUserCollectionListDto,
    currentUserTrashedCollectionListDto,
    deleteCollectionDto,
    findOneCollectionDto,
    forkCollectionDto,
    restoreCollectionDto,
    updateCollectionDto,
} from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperCollectionsOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'post',
        path: '/developer/collections',
        tag: 'Collections',
        summary: 'Create a collection',
        body: createCollectionDto.input,
        response: createCollectionDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/collections/{id}',
        tag: 'Collections',
        summary: 'Delete a collection',
        params: deleteCollectionDto.input,
        response: deleteCollectionDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/collections/{id}/restore',
        tag: 'Collections',
        summary: 'Restore a collection from trash',
        params: restoreCollectionDto.input,
        response: restoreCollectionDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/collections/{id}/permanent',
        tag: 'Collections',
        summary: 'Permanently delete a collection from trash',
        params: deleteCollectionDto.input,
        response: deleteCollectionDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'post',
        path: '/developer/collections/{id}/forks',
        tag: 'Collections',
        summary: 'Fork a collection',
        params: forkCollectionDto.input,
        response: forkCollectionDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/collections/{id}',
        tag: 'Collections',
        summary: 'Update a collection',
        params: updateCollectionDto.input.pick({ id: true }),
        body: updateCollectionDto.input.omit({ id: true }),
        response: updateCollectionDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/collections',
        tag: 'Collections',
        summary: 'List collections',
        query: collectionListDto.input,
        response: collectionListDto.output,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/collections/me',
        tag: 'Collections',
        summary: 'List the current developer collections',
        query: currentUserCollectionListDto.input,
        response: collectionListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/collections/trash',
        tag: 'Collections',
        summary: 'List the current developer trashed collections',
        query: currentUserTrashedCollectionListDto.input,
        response: currentUserTrashedCollectionListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/collections/{id}',
        tag: 'Collections',
        summary: 'Get a collection',
        params: findOneCollectionDto.input,
        response: findOneCollectionDto.output,
    });
}

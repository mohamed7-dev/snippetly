import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
    createSnippetDto,
    currentUserSnippetListDto,
    currentUserTrashedSnippetListDto,
    deleteSnippetDto,
    findOneSnippetDto,
    forkSnippetDto,
    restoreSnippetDto,
    snippetListDto,
    updateSnippetDto,
    userFriendsSnippetsListDto,
} from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperSnippetsOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'post',
        path: '/developer/snippets',
        tag: 'Snippets',
        summary: 'Create a snippet',
        body: createSnippetDto.input,
        response: createSnippetDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/snippets/{id}',
        tag: 'Snippets',
        summary: 'Update a snippet',
        params: updateSnippetDto.input.pick({ id: true }),
        body: updateSnippetDto.input.omit({ id: true }),
        response: updateSnippetDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/snippets/{id}',
        tag: 'Snippets',
        summary: 'Delete a snippet',
        params: deleteSnippetDto.input,
        response: deleteSnippetDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/snippets/{id}/restore',
        tag: 'Snippets',
        summary: 'Restore a snippet from trash',
        params: restoreSnippetDto.input,
        response: restoreSnippetDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/snippets/{id}/permanent',
        tag: 'Snippets',
        summary: 'Permanently delete a snippet from trash',
        params: deleteSnippetDto.input,
        response: deleteSnippetDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'post',
        path: '/developer/snippets/{id}/forks',
        tag: 'Snippets',
        summary: 'Fork a snippet',
        params: forkSnippetDto.input,
        response: snippetListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/snippets',
        tag: 'Snippets',
        summary: 'List snippets',
        query: snippetListDto.input,
        response: snippetListDto.output,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/snippets/me',
        tag: 'Snippets',
        summary: 'List the current developer snippets',
        query: currentUserSnippetListDto.input,
        response: currentUserSnippetListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/snippets/trash',
        tag: 'Snippets',
        summary: 'List the current developer trashed snippets',
        query: currentUserTrashedSnippetListDto.input,
        response: currentUserTrashedSnippetListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/snippets/friends',
        tag: 'Snippets',
        summary: 'List snippets from friends',
        query: userFriendsSnippetsListDto.input,
        response: userFriendsSnippetsListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/snippets/{id}',
        tag: 'Snippets',
        summary: 'Get a snippet',
        params: findOneSnippetDto.input,
        response: findOneSnippetDto.output,
    });
}

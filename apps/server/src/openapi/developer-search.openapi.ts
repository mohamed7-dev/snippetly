import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { searchDto } from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperSearchOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'get',
        path: '/developer/search',
        tag: 'Search',
        summary: 'Search snippets, collections, developers, and tags',
        query: searchDto.input,
        response: searchDto.output,
    });
}

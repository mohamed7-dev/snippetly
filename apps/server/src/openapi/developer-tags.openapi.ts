import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { popularTagsDto } from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperTagsOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'get',
        path: '/developer/tags/popular',
        tag: 'Tags',
        summary: 'List popular tags',
        query: popularTagsDto.input,
        response: popularTagsDto.output,
        authenticated: true,
    });
}

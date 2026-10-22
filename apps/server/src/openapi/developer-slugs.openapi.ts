import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { generateSlugForEntityDto } from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperSlugsOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'put',
        path: '/developer/slugs',
        tag: 'Slugs',
        summary: 'Generate an available slug for an entity field',
        body: generateSlugForEntityDto.input,
        response: generateSlugForEntityDto.output,
        authenticated: true,
    });
}

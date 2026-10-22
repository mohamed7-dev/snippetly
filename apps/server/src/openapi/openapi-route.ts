import { OpenAPIRegistry, type RouteConfig } from '@asteasolutions/zod-to-openapi';
import z, { type ZodType } from 'zod';

export type RouteParameterSchema = NonNullable<NonNullable<RouteConfig['request']>['params']>;

type ResponseSchema = ZodType;

type ResponseVariant = {
    schema: ResponseSchema;
    exampleName: string;
    example: unknown;
};

function getSchemaShape(schema: ResponseSchema): Record<string, ResponseSchema> | undefined {
    const definition = (schema as any)._def;
    if (definition?.type !== 'object') return undefined;
    return typeof definition.shape === 'function' ? definition.shape() : definition.shape;
}

function getExampleValue(schema: ResponseSchema, key = 'value'): unknown {
    const definition = (schema as any)._def;

    if (key === 'itemsCount') return 1;

    if (definition?.type === 'union') {
        const firstOption = definition.options?.[0];
        return firstOption ? getExampleValue(firstOption, key) : null;
    }

    if (definition?.type === 'object') {
        const fields = getSchemaShape(schema) ?? {};
        return Object.fromEntries(
            Object.entries(fields).map(([field, fieldSchema]) => [
                field,
                getExampleValue(fieldSchema, field),
            ]),
        );
    }

    if (definition?.type === 'literal') return definition.values?.[0];
    if (definition?.type === 'enum') return definition.entries?.[0] ?? definition.values?.[0];
    if (definition?.type === 'string') return `${key} example`;
    if (definition?.type === 'number' || definition?.type === 'int') return 0;
    if (definition?.type === 'boolean') return false;
    if (definition?.type === 'array') return [getExampleValue(definition.element, key)];
    if (definition?.type === 'optional' || definition?.type === 'nullable') {
        return getExampleValue(definition.innerType, key);
    }

    return null;
}

function getLiteralValue(schema?: ResponseSchema): string | number | undefined {
    const value = (schema as any)?._def?.values?.[0];
    return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function getResponseVariants(schema: ResponseSchema): Map<number, ResponseVariant[]> {
    const options: ResponseSchema[] =
        (schema as any)._def?.type === 'union'
            ? ((schema as any)._def.options as ResponseSchema[])
            : [schema];
    const responses = new Map<number, ResponseVariant[]>();

    for (const [index, option] of options.entries()) {
        const shape = getSchemaShape(option);
        const statusCode = Number(getLiteralValue(shape?.httpStatusCode) ?? 200);
        const existing = responses.get(statusCode) ?? [];
        const code = getLiteralValue(shape?.code);
        existing.push({
            schema: option,
            exampleName: typeof code === 'string' ? code : `variant${index + 1}`,
            example: getExampleValue(option),
        });
        responses.set(statusCode, existing);
    }

    return responses;
}

export function registerRoute(
    registry: OpenAPIRegistry,
    options: {
        method: RouteConfig['method'];
        path: string;
        tag: string;
        summary: string;
        body?: ZodType;
        params?: RouteParameterSchema;
        query?: RouteParameterSchema;
        response: ZodType;
        authenticated?: boolean;
        optionalAuthentication?: boolean;
        sessionTokenHeaderDescription?: string;
    },
) {
    const request: NonNullable<RouteConfig['request']> = {};

    if (options.body) {
        request.body = {
            content: {
                'application/json': {
                    schema: options.body,
                },
            },
        };
    }
    if (options.params) request.params = options.params;
    if (options.query) request.query = options.query;

    const responses = Object.fromEntries(
        [...getResponseVariants(options.response)].map(([statusCode, variants]) => [
            statusCode,
            {
                description: statusCode === 200 ? 'Successful response' : 'Error response',
                ...(statusCode === 200 && options.sessionTokenHeaderDescription
                    ? {
                          headers: {
                              'x-session-token': {
                                  description: options.sessionTokenHeaderDescription,
                                  schema: { type: 'string' },
                              },
                          },
                      }
                    : {}),
                content: {
                    'application/json': {
                        schema:
                            variants.length === 1
                                ? variants[0].schema
                                : z.union(
                                      variants.map(variant => variant.schema) as [
                                          ResponseSchema,
                                          ResponseSchema,
                                          ...ResponseSchema[],
                                      ],
                                  ),
                        examples: Object.fromEntries(
                            variants.map(variant => [variant.exampleName, { value: variant.example }]),
                        ),
                    },
                },
            },
        ]),
    );

    registry.registerPath({
        method: options.method,
        path: options.path,
        tags: [options.tag],
        summary: options.summary,
        request,
        security: options.authenticated
            ? [{ bearerAuth: [] }]
            : options.optionalAuthentication
              ? [{ bearerAuth: [] }, {}]
              : undefined,
        responses: responses as any,
    });
}

import { OpenAPIRegistry, OpenApiGeneratorV3, type RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
    acceptFriendshipRequestDto,
    activeDeveloperDto,
    authenticateDeveloperDto,
    cancelFriendshipRequestDto,
    changeEmailAddressDto,
    collectionListDto,
    createCollectionDto,
    createSnippetDto,
    currentUserCollectionListDto,
    currentUserFriendsListDto,
    currentUserInboxListDto,
    currentUserOutboxListDto,
    currentUserSnippetListDto,
    deleteCollectionDto,
    deleteDeveloperAccountDto,
    deleteSnippetDto,
    developerListDto,
    developerUserMeDto,
    findOneCollectionDto,
    findOneDeveloperDto,
    findOneSnippetDto,
    forkCollectionDto,
    forkSnippetDto,
    logoutDeveloperDto,
    popularTagsDto,
    refreshVerificationTokenDto,
    registerDeveloperAccountDto,
    rejectFriendshipRequestDto,
    requestEmailAddressChangeDto,
    requestPasswordResetDto,
    resetPasswordDto,
    sendFriendshipRequestDto,
    snippetListDto,
    updateCollectionDto,
    updateDeveloperAccountDto,
    updatePasswordDto,
    updateSnippetDto,
    userFriendsSnippetsListDto,
    verifyAccountDto,
} from '@snippetly/common/dto';
import z, { type ZodType } from 'zod';

const registry = new OpenAPIRegistry();

const cookieAuth = 'cookieAuth';
type RouteParameterSchema = NonNullable<NonNullable<RouteConfig['request']>['params']>;

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

function registerRoute(options: {
    method: RouteConfig['method'];
    path: string;
    tag: string;
    summary: string;
    body?: ZodType;
    params?: RouteParameterSchema;
    query?: RouteParameterSchema;
    response: ZodType;
    authenticated?: boolean;
}) {
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
        security: options.authenticated ? [{ [cookieAuth]: [] }] : undefined,
        responses,
    });
}

registry.registerComponent('securitySchemes', cookieAuth, {
    type: 'apiKey',
    in: 'cookie',
    name: 'session',
});

registerRoute({
    method: 'post',
    path: '/developer/auth/accounts',
    tag: 'Authentication',
    summary: 'Register a developer account',
    body: registerDeveloperAccountDto.input,
    response: registerDeveloperAccountDto.output,
});
registerRoute({
    method: 'patch',
    path: '/developer/auth/accounts/me',
    tag: 'Authentication',
    summary: 'Update the current account password',
    body: updatePasswordDto.input,
    response: updatePasswordDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/auth/accounts/me',
    tag: 'Authentication',
    summary: 'Get the current authenticated account',
    response: developerUserMeDto.output,
    authenticated: true,
});
registerRoute({
    method: 'post',
    path: '/developer/auth/sessions',
    tag: 'Authentication',
    summary: 'Authenticate a developer',
    body: authenticateDeveloperDto.input,
    response: authenticateDeveloperDto.output,
});
registerRoute({
    method: 'delete',
    path: '/developer/auth/sessions/current',
    tag: 'Authentication',
    summary: 'Log out the current session',
    response: logoutDeveloperDto.output,
});
registerRoute({
    method: 'post',
    path: '/developer/auth/verification-tokens',
    tag: 'Authentication',
    summary: 'Request an email verification token',
    body: refreshVerificationTokenDto.input,
    response: refreshVerificationTokenDto.output,
});
registerRoute({
    method: 'post',
    path: '/developer/auth/account-verifications',
    tag: 'Authentication',
    summary: 'Verify a developer account',
    body: verifyAccountDto.input,
    response: verifyAccountDto.output,
});
registerRoute({
    method: 'post',
    path: '/developer/auth/account-email-address-change',
    tag: 'Authentication',
    summary: 'Request an email address change',
    body: requestEmailAddressChangeDto.input,
    response: requestEmailAddressChangeDto.output,
    authenticated: true,
});
registerRoute({
    method: 'patch',
    path: '/developer/auth/account-email-address-change',
    tag: 'Authentication',
    summary: 'Confirm an email address change',
    body: changeEmailAddressDto.input,
    response: changeEmailAddressDto.output,
    authenticated: true,
});
registerRoute({
    method: 'post',
    path: '/developer/auth/account-password-change',
    tag: 'Authentication',
    summary: 'Request a password reset',
    body: requestPasswordResetDto.input,
    response: requestPasswordResetDto.output,
});
registerRoute({
    method: 'patch',
    path: '/developer/auth/account-password-change',
    tag: 'Authentication',
    summary: 'Reset the account password',
    body: resetPasswordDto.input,
    response: resetPasswordDto.output,
});

registerRoute({
    method: 'post',
    path: '/developer/collections',
    tag: 'Collections',
    summary: 'Create a collection',
    body: createCollectionDto.input,
    response: createCollectionDto.output,
    authenticated: true,
});

registerRoute({
    method: 'delete',
    path: '/developer/collections/{id}',
    tag: 'Collections',
    summary: 'Delete a collection',
    params: deleteCollectionDto.input,
    response: deleteCollectionDto.output,
    authenticated: true,
});
registerRoute({
    method: 'post',
    path: '/developer/collections/{id}/forks',
    tag: 'Collections',
    summary: 'Fork a collection',
    params: forkCollectionDto.input,
    response: forkCollectionDto.output,
    authenticated: true,
});
registerRoute({
    method: 'patch',
    path: '/developer/collections/{id}',
    tag: 'Collections',
    summary: 'Update a collection',
    params: updateCollectionDto.input.pick({ id: true }),
    body: updateCollectionDto.input.omit({ id: true }),
    response: updateCollectionDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/collections',
    tag: 'Collections',
    summary: 'List collections',
    query: collectionListDto.input,
    response: collectionListDto.output,
});
registerRoute({
    method: 'get',
    path: '/developer/collections/me',
    tag: 'Collections',
    summary: 'List the current developer collections',
    query: currentUserCollectionListDto.input,
    response: collectionListDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/collections/{id}',
    tag: 'Collections',
    summary: 'Get a collection',
    params: findOneCollectionDto.input,
    response: findOneCollectionDto.output,
});

registerRoute({
    method: 'post',
    path: '/developer/snippets',
    tag: 'Snippets',
    summary: 'Create a snippet',
    body: createSnippetDto.input,
    response: createSnippetDto.output,
    authenticated: true,
});
registerRoute({
    method: 'patch',
    path: '/developer/snippets/{id}',
    tag: 'Snippets',
    summary: 'Update a snippet',
    params: updateSnippetDto.input.pick({ id: true }),
    body: updateSnippetDto.input.omit({ id: true }),
    response: updateSnippetDto.output,
    authenticated: true,
});
registerRoute({
    method: 'delete',
    path: '/developer/snippets/{id}',
    tag: 'Snippets',
    summary: 'Delete a snippet',
    params: deleteSnippetDto.input,
    response: deleteSnippetDto.output,
    authenticated: true,
});
registerRoute({
    method: 'post',
    path: '/developer/snippets/{id}/forks',
    tag: 'Snippets',
    summary: 'Fork a snippet',
    params: forkSnippetDto.input,
    response: snippetListDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/snippets',
    tag: 'Snippets',
    summary: 'List snippets',
    query: snippetListDto.input,
    response: snippetListDto.output,
});
registerRoute({
    method: 'get',
    path: '/developer/snippets/me',
    tag: 'Snippets',
    summary: 'List the current developer snippets',
    query: currentUserSnippetListDto.input,
    response: currentUserSnippetListDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/snippets/friends',
    tag: 'Snippets',
    summary: 'List snippets from friends',
    query: userFriendsSnippetsListDto.input,
    response: userFriendsSnippetsListDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/snippets/{id}',
    tag: 'Snippets',
    summary: 'Get a snippet',
    params: findOneSnippetDto.input,
    response: findOneSnippetDto.output,
});

registerRoute({
    method: 'get',
    path: '/developer/developers',
    tag: 'Developers',
    summary: 'List developers',
    query: developerListDto.input,
    response: developerListDto.output,
});
registerRoute({
    method: 'get',
    path: '/developer/developers/me',
    tag: 'Developers',
    summary: 'Get the current developer',
    response: activeDeveloperDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/developers/{id}',
    tag: 'Developers',
    summary: 'Get a developer',
    params: findOneDeveloperDto.input,
    response: findOneDeveloperDto.output,
});
registerRoute({
    method: 'patch',
    path: '/developer/developers/me',
    tag: 'Developers',
    summary: 'Update the current developer',
    body: updateDeveloperAccountDto.input,
    response: updateDeveloperAccountDto.output,
    authenticated: true,
});
registerRoute({
    method: 'delete',
    path: '/developer/developers/me',
    tag: 'Developers',
    summary: 'Delete the current developer account',
    response: deleteDeveloperAccountDto.output,
    authenticated: true,
});

registerRoute({
    method: 'post',
    path: '/developer/friendships/{friendId}/requests',
    tag: 'Friendships',
    summary: 'Send a friendship request',
    params: sendFriendshipRequestDto.input,
    response: sendFriendshipRequestDto.output,
    authenticated: true,
});
registerRoute({
    method: 'patch',
    path: '/developer/friendships/{friendId}/accept',
    tag: 'Friendships',
    summary: 'Accept a friendship request',
    params: acceptFriendshipRequestDto.input,
    response: acceptFriendshipRequestDto.output,
    authenticated: true,
});
registerRoute({
    method: 'patch',
    path: '/developer/friendships/{friendId}/reject',
    tag: 'Friendships',
    summary: 'Reject a friendship request',
    params: rejectFriendshipRequestDto.input,
    response: rejectFriendshipRequestDto.output,
    authenticated: true,
});
registerRoute({
    method: 'delete',
    path: '/developer/friendships/{friendId}',
    tag: 'Friendships',
    summary: 'Cancel a friendship request',
    params: cancelFriendshipRequestDto.input,
    response: cancelFriendshipRequestDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/friendships/friends',
    tag: 'Friendships',
    summary: 'List current friends',
    query: currentUserFriendsListDto.input,
    response: currentUserFriendsListDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/friendships/inbox',
    tag: 'Friendships',
    summary: 'List incoming friendship requests',
    query: currentUserInboxListDto.input,
    response: currentUserInboxListDto.output,
    authenticated: true,
});
registerRoute({
    method: 'get',
    path: '/developer/friendships/outbox',
    tag: 'Friendships',
    summary: 'List outgoing friendship requests',
    query: currentUserOutboxListDto.input,
    response: currentUserOutboxListDto.output,
    authenticated: true,
});

registerRoute({
    method: 'get',
    path: '/developer/tags/popular',
    tag: 'Tags',
    summary: 'List popular tags',
    query: popularTagsDto.input,
    response: popularTagsDto.output,
    authenticated: true,
});

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

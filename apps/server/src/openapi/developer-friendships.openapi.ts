import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
    acceptFriendshipRequestDto,
    cancelFriendshipRequestDto,
    currentUserFriendsListDto,
    currentUserInboxListDto,
    currentUserOutboxListDto,
    rejectFriendshipRequestDto,
    sendFriendshipRequestDto,
} from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperFriendshipsOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'post',
        path: '/developer/friendships/{friendId}/requests',
        tag: 'Friendships',
        summary: 'Send a friendship request',
        params: sendFriendshipRequestDto.input,
        response: sendFriendshipRequestDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/friendships/{friendId}/accept',
        tag: 'Friendships',
        summary: 'Accept a friendship request',
        params: acceptFriendshipRequestDto.input,
        response: acceptFriendshipRequestDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/friendships/{friendId}/reject',
        tag: 'Friendships',
        summary: 'Reject a friendship request',
        params: rejectFriendshipRequestDto.input,
        response: rejectFriendshipRequestDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/friendships/{friendId}',
        tag: 'Friendships',
        summary: 'Cancel a friendship request',
        params: cancelFriendshipRequestDto.input,
        response: cancelFriendshipRequestDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/friendships/friends',
        tag: 'Friendships',
        summary: 'List current friends',
        query: currentUserFriendsListDto.input,
        response: currentUserFriendsListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/friendships/inbox',
        tag: 'Friendships',
        summary: 'List incoming friendship requests',
        query: currentUserInboxListDto.input,
        response: currentUserInboxListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/friendships/outbox',
        tag: 'Friendships',
        summary: 'List outgoing friendship requests',
        query: currentUserOutboxListDto.input,
        response: currentUserOutboxListDto.output,
        authenticated: true,
    });
}

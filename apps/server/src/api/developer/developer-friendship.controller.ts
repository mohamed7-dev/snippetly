import {
    acceptFriendshipRequestDto,
    cancelFriendshipRequestDto,
    currentUserFriendsListDto,
    currentUserInboxListDto,
    currentUserOutboxListDto,
    Permission,
    rejectFriendshipRequestDto,
    sendFriendshipRequestDto,
} from '@snippetly/common/dto';
import { Router } from 'express';
import { isApiError } from '../../common/errors/api-error';
import { defineRateLimiter } from '../../common/helpers/define-rate-limiter';
import { AppRouter } from '../../common/types/app-router.interface';
import { ConfigService } from '../../config/config.service';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { DeveloperService } from '../../services/domain/developer.service';
import { FriendshipService } from '../../services/domain/friendship.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'friendships',
    version: 1,
})
export class DeveloperFriendshipController implements AppRouter {
    constructor(
        private readonly friendshipService: FriendshipService,
        private readonly developerService: DeveloperService,
        private readonly configService: ConfigService,
    ) {}

    friendshipWriteLimiter = defineRateLimiter(
        {
            windowMs: 15 * 60 * 1000,
            max: 50,
        },
        this.configService.apiOptions,
    );

    friendshipReadLimiter = defineRateLimiter(
        {
            windowMs: 60 * 1000,
            max: 120,
        },
        this.configService.apiOptions,
    );

    initRoutes(router: Router): Router {
        router.post(
            '/:friendId/requests',
            ...defineRoutePipeline({
                before: [this.friendshipWriteLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: sendFriendshipRequestDto.input,
                response: sendFriendshipRequestDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );

                    const result = await this.friendshipService.sendFriendshipRequest(
                        req.getRequestContext(),
                        {
                            requesterId: developer.id,
                            addresseeId: req.params.friendId,
                            actorId: developer.id,
                        },
                    );

                    if (isApiError(result)) {
                        return res.status(result.httpStatusCode).json(result);
                    }

                    res.status(200).json(result);
                },
            }),
        );

        router.patch(
            '/:friendId/accept',
            ...defineRoutePipeline({
                before: [this.friendshipWriteLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: acceptFriendshipRequestDto.input,
                response: acceptFriendshipRequestDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );

                    const result = await this.friendshipService.acceptFriendshipRequest(
                        req.getRequestContext(),
                        {
                            requesterId: req.params.friendId,
                            addresseeId: developer.id,
                            actorId: developer.id,
                        },
                    );

                    if (isApiError(result)) {
                        return res.status(result.httpStatusCode).json(result);
                    }

                    res.status(200).json(result);
                },
            }),
        );

        router.patch(
            '/:friendId/reject',
            ...defineRoutePipeline({
                before: [this.friendshipWriteLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: rejectFriendshipRequestDto.input,
                response: rejectFriendshipRequestDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );

                    const result = await this.friendshipService.rejectFriendshipRequest(
                        req.getRequestContext(),
                        {
                            requesterId: req.params.friendId,
                            addresseeId: developer.id,
                            actorId: developer.id,
                        },
                    );

                    if (isApiError(result)) {
                        return res.status(result.httpStatusCode).json(result);
                    }

                    res.status(200).json(result);
                },
            }),
        );

        router.delete(
            '/:friendId',
            ...defineRoutePipeline({
                before: [this.friendshipWriteLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: cancelFriendshipRequestDto.input,
                response: cancelFriendshipRequestDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );

                    const result = await this.friendshipService.cancelFriendshipRequest(
                        req.getRequestContext(),
                        {
                            requesterId: developer.id,
                            addresseeId: req.params.friendId,
                            actorId: developer.id,
                        },
                    );

                    if (isApiError(result)) {
                        return res.status(result.httpStatusCode).json(result);
                    }

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/current',
            ...defineRoutePipeline({
                before: [this.friendshipReadLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                query: currentUserFriendsListDto.input,
                response: currentUserFriendsListDto.output,
                handler: async (req, res) => {
                    const ctx = req.getRequestContext();
                    const developer = await this.developerService.getActiveDeveloper(ctx, true);

                    const result = await this.friendshipService.getUserFriends(ctx, developer.id, req.query);

                    const friendshipsWithRecentSnippets =
                        await this.friendshipService.attachRecentSnippetsToFriendships(
                            ctx,
                            developer,
                            result.items,
                        );

                    const friendshipsWithFavouriteStatus =
                        await this.friendshipService.attachFavouriteStatusToParticipants(ctx, result.items);

                    const finalResult = {
                        ...result,
                        items: result.items.map((item, index) => ({
                            ...item,
                            requester: {
                                ...item.requester,
                                isVerified: item.requester.isVerified,
                                relationshipWithCurrentUser: {
                                    isFavouritedByCurrentUser:
                                        friendshipsWithFavouriteStatus[index].requester
                                            .isFavouritedByCurrentUser,
                                },
                                activity: {
                                    stats: {
                                        snippetsCount:
                                            friendshipsWithRecentSnippets[index].requester.snippetsCount,
                                    },
                                    recentSnippets:
                                        friendshipsWithRecentSnippets[index].requester.recentSnippets,
                                },
                            },
                            addressee: {
                                ...item.addressee,
                                isVerified: item.addressee.isVerified,
                                relationshipWithCurrentUser: {
                                    isFavouritedByCurrentUser:
                                        friendshipsWithFavouriteStatus[index].addressee
                                            .isFavouritedByCurrentUser,
                                },
                                activity: {
                                    stats: {
                                        snippetsCount:
                                            friendshipsWithRecentSnippets[index].addressee.snippetsCount,
                                    },
                                    recentSnippets:
                                        friendshipsWithRecentSnippets[index].addressee.recentSnippets,
                                },
                            },
                        })),
                    };

                    res.status(200).json(finalResult);
                },
            }),
        );

        router.get(
            '/inbox',
            ...defineRoutePipeline({
                before: [this.friendshipReadLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                query: currentUserInboxListDto.input,
                response: currentUserInboxListDto.output,
                handler: async (req, res) => {
                    const ctx = req.getRequestContext();

                    const developer = await this.developerService.getActiveDeveloper(ctx, true);

                    const result = await this.friendshipService.getCurrentUserInbox(
                        ctx,
                        developer.id,
                        req.query,
                    );

                    const inboxFriendsWithFavouriteStatus =
                        await this.friendshipService.attachFavouriteStatusToParticipants(ctx, result.items);

                    const finalResult = {
                        ...result,
                        items: result.items.map((item, index) => ({
                            ...item,
                            requester: {
                                ...item.requester,
                                isVerified: item.requester.isVerified,
                                relationshipWithCurrentUser: {
                                    isFavouritedByCurrentUser:
                                        inboxFriendsWithFavouriteStatus[index].requester
                                            .isFavouritedByCurrentUser,
                                },
                            },
                            addressee: {
                                ...item.addressee,
                                isVerified: item.addressee.isVerified,
                                relationshipWithCurrentUser: {
                                    isFavouritedByCurrentUser:
                                        inboxFriendsWithFavouriteStatus[index].addressee
                                            .isFavouritedByCurrentUser,
                                },
                            },
                        })),
                    };
                    res.status(200).json(finalResult);
                },
            }),
        );

        router.get(
            '/outbox',
            ...defineRoutePipeline({
                before: [this.friendshipReadLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                query: currentUserOutboxListDto.input,
                response: currentUserOutboxListDto.output,
                handler: async (req, res) => {
                    const ctx = req.getRequestContext();

                    const developer = await this.developerService.getActiveDeveloper(ctx, true);

                    const result = await this.friendshipService.getCurrentUserOutbox(
                        ctx,
                        developer.id,
                        req.query,
                    );

                    const outboxFriendsWithFavouriteStatus =
                        await this.friendshipService.attachFavouriteStatusToParticipants(ctx, result.items);

                    const finalResult = {
                        ...result,
                        items: result.items.map((item, index) => ({
                            ...item,
                            requester: {
                                ...item.requester,
                                isVerified: item.requester.isVerified,
                                relationshipWithCurrentUser: {
                                    isFavouritedByCurrentUser:
                                        outboxFriendsWithFavouriteStatus[index].requester
                                            .isFavouritedByCurrentUser,
                                },
                            },
                            addressee: {
                                ...item.addressee,
                                isVerified: item.addressee.isVerified,
                                relationshipWithCurrentUser: {
                                    isFavouritedByCurrentUser:
                                        outboxFriendsWithFavouriteStatus[index].addressee
                                            .isFavouritedByCurrentUser,
                                },
                            },
                        })),
                    };
                    res.status(200).json(finalResult);
                },
            }),
        );

        return router;
    }
}

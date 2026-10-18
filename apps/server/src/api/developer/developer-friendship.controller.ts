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
import rateLimit from 'express-rate-limit';
import { isApiError } from '../../common/errors/api-error';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { DeveloperService } from '../../services/domain/developer.service';
import { FriendshipService } from '../../services/domain/friendship.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';
import { RequestContext } from '../request-context/request-context';

@Controller({
    path: 'friendships',
    version: 1,
})
export class DeveloperFriendshipController implements AppRouter {
    constructor(
        private readonly friendshipService: FriendshipService,
        private readonly developerService: DeveloperService,
    ) {}

    friendshipWriteLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
    });

    friendshipReadLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
    });

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
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );

                    let result = await this.friendshipService.getUserFriends(
                        req.getRequestContext(),
                        developer.id,
                        req.query,
                    );

                    if (result.items.length > 0) {
                        result = await this.friendshipService.enrichFriends(
                            req.getRequestContext(),
                            result.items,
                            result.itemsCount,
                            developer.id,
                        );
                    }

                    res.status(200).json(
                        await this.attachFavouriteStatusToParticipants(req.getRequestContext(), result),
                    );
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
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );

                    const result = await this.friendshipService.getCurrentUserInbox(
                        req.getRequestContext(),
                        developer.id,
                        req.query,
                    );

                    res.status(200).json(
                        await this.attachFavouriteStatusToParticipants(req.getRequestContext(), result),
                    );
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
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );

                    const result = await this.friendshipService.getCurrentUserOutbox(
                        req.getRequestContext(),
                        developer.id,
                        req.query,
                    );

                    res.status(200).json(
                        await this.attachFavouriteStatusToParticipants(req.getRequestContext(), result),
                    );
                },
            }),
        );

        return router;
    }

    private async attachFavouriteStatusToParticipants<
        TItem extends {
            requester: { id: string; isVerified: boolean };
            addressee: { id: string; isVerified: boolean };
        },
    >(ctx: RequestContext, result: { items: TItem[]; itemsCount: number }) {
        const participants = result.items.flatMap(({ requester, addressee }) => [requester, addressee]);
        const participantsWithStatus = await this.developerService.attachFavouriteStatus(ctx, participants);
        const statusByDeveloperId = new Map<string, boolean>();
        for (const { id, isFavouritedByCurrentUser } of participantsWithStatus) {
            statusByDeveloperId.set(id, isFavouritedByCurrentUser);
        }

        return {
            ...result,
            items: result.items.map(item => ({
                ...item,
                requester: {
                    ...item.requester,
                    isVerified: item.requester.isVerified,
                    isFavouritedByCurrentUser: statusByDeveloperId.get(item.requester.id) ?? false,
                },
                addressee: {
                    ...item.addressee,
                    isVerified: item.addressee.isVerified,
                    isFavouritedByCurrentUser: statusByDeveloperId.get(item.addressee.id) ?? false,
                },
            })),
        };
    }
}

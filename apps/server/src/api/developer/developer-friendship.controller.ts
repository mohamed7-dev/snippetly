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
import { ForbiddenError } from '../../common/errors/errors';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { FriendshipService } from '../../services/domain/friendship.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'developer/friendships',
    version: 1,
})
export class DeveloperFriendshipController implements AppRouter {
    constructor(private readonly friendshipService: FriendshipService) {}

    initRoutes(router: Router): Router {
        router.post(
            '/:friendId/requests',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Authenticated] })],
                params: sendFriendshipRequestDto.input,
                response: sendFriendshipRequestDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const userId = req.getRequestContext().activeUserId;
                    if (!userId) {
                        throw new ForbiddenError();
                    }

                    const result = await this.friendshipService.sendFriendshipRequest(
                        req.getRequestContext(),
                        {
                            requesterId: userId,
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
                before: [authGuard({ permissions: [Permission.Authenticated] })],
                params: acceptFriendshipRequestDto.input,
                response: acceptFriendshipRequestDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const userId = req.getRequestContext().activeUserId;
                    if (!userId) {
                        throw new ForbiddenError();
                    }

                    const result = await this.friendshipService.acceptFriendshipRequest(
                        req.getRequestContext(),
                        {
                            requesterId: req.params.friendId,
                            addresseeId: userId,
                            actorId: userId,
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
                before: [authGuard({ permissions: [Permission.Authenticated] })],
                params: rejectFriendshipRequestDto.input,
                response: rejectFriendshipRequestDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const userId = req.getRequestContext().activeUserId;
                    if (!userId) {
                        throw new ForbiddenError();
                    }

                    const result = await this.friendshipService.rejectFriendshipRequest(
                        req.getRequestContext(),
                        {
                            requesterId: req.params.friendId,
                            addresseeId: userId,
                            actorId: userId,
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
                before: [authGuard({ permissions: [Permission.Authenticated] })],
                params: cancelFriendshipRequestDto.input,
                response: cancelFriendshipRequestDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const userId = req.getRequestContext().activeUserId;
                    if (!userId) {
                        throw new ForbiddenError();
                    }

                    const result = await this.friendshipService.cancelFriendshipRequest(
                        req.getRequestContext(),
                        {
                            requesterId: userId,
                            addresseeId: req.params.friendId,
                            actorId: userId,
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
            '/friends',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Authenticated] })],
                query: currentUserFriendsListDto.input,
                response: currentUserFriendsListDto.output,
                handler: async (req, res) => {
                    const userId = req.getRequestContext().activeUserId;
                    if (!userId) {
                        throw new ForbiddenError();
                    }

                    const result = await this.friendshipService.getCurrentUserFriends(
                        req.getRequestContext(),
                        userId,
                        req.query,
                    );

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/inbox',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Authenticated] })],
                query: currentUserInboxListDto.input,
                response: currentUserInboxListDto.output,
                handler: async (req, res) => {
                    const userId = req.getRequestContext().activeUserId;
                    if (!userId) {
                        throw new ForbiddenError();
                    }

                    const result = await this.friendshipService.getCurrentUserInbox(
                        req.getRequestContext(),
                        userId,
                        req.query,
                    );

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/outbox',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Authenticated] })],
                query: currentUserOutboxListDto.input,
                response: currentUserOutboxListDto.output,
                handler: async (req, res) => {
                    const userId = req.getRequestContext().activeUserId;
                    if (!userId) {
                        throw new ForbiddenError();
                    }

                    const result = await this.friendshipService.getCurrentUserOutbox(
                        req.getRequestContext(),
                        userId,
                        req.query,
                    );

                    res.status(200).json(result);
                },
            }),
        );

        return router;
    }
}

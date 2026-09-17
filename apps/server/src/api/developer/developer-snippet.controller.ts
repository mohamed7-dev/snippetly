import {
    createSnippetDto,
    currentUserFriendsSnippetsListDto,
    deleteSnippetDto,
    findOneSnippetDto,
    forkSnippetDto,
    Permission,
    snippetListDto,
    updateSnippetDto,
    userFriendsSnippetsListDto,
} from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { EntityNotFoundError, ForbiddenError } from '../../common/errors/errors';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { DeveloperService } from '../../services/domain/developer.service';
import { SnippetService } from '../../services/domain/snippet.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'developer/snippets',
    version: 1,
})
export class DeveloperSnippetController implements AppRouter {
    constructor(
        private readonly snippetService: SnippetService,
        private readonly developerService: DeveloperService,
    ) {}

    snippetWriteLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
    });

    snippetReadLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
    });

    initRoutes(router: Router): Router {
        router.post(
            '/',
            ...defineRoutePipeline({
                before: [this.snippetWriteLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                body: createSnippetDto.input,
                response: createSnippetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.snippetService.create(req.getRequestContext(), req.body);
                    res.status(200).json(result);
                },
            }),
        );

        router.patch(
            '/:id',
            ...defineRoutePipeline({
                before: [this.snippetWriteLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                body: updateSnippetDto.input.omit({ id: true }),
                params: updateSnippetDto.input.pick({ id: true }),
                response: updateSnippetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.snippetService.update(req.getRequestContext(), {
                        ...req.params,
                        ...req.body,
                    });
                    res.status(200).json(result);
                },
            }),
        );

        router.delete(
            '/:id',
            ...defineRoutePipeline({
                before: [this.snippetWriteLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: deleteSnippetDto.input,
                response: deleteSnippetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.snippetService.delete(req.getRequestContext(), req.params);
                    res.status(200).json(result);
                },
            }),
        );

        router.post(
            '/:id/forks',
            ...defineRoutePipeline({
                before: [this.snippetWriteLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: forkSnippetDto.input,
                response: forkSnippetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.snippetService.fork(req.getRequestContext(), req.params);
                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/',
            ...defineRoutePipeline({
                before: [this.snippetReadLimiter],
                query: snippetListDto.input,
                response: snippetListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(req.getRequestContext());
                    const shouldRestrictToPublic =
                        !req.query.creator || !developer || req.query.creator !== developer.id;
                    const result = await this.snippetService.find(req.getRequestContext(), {
                        ...req.query,
                        filter: {
                            ...req.query.filter,
                            ...(shouldRestrictToPublic ? { isPrivate: { equals: false } } : {}),
                        },
                    });
                    if (shouldRestrictToPublic) {
                        result.items = omit(result.items, ['isPrivate', 'updatedAt'], true);
                    }
                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/me',
            ...defineRoutePipeline({
                before: [this.snippetReadLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                query: snippetListDto.input.omit({ creator: true }),
                response: snippetListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(req.getRequestContext());
                    if (!developer) {
                        throw new ForbiddenError();
                    }
                    const result = await this.snippetService.find(req.getRequestContext(), {
                        ...req.query,
                        creator: developer.id,
                    });

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/friends',
            ...defineRoutePipeline({
                before: [this.snippetReadLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                query: currentUserFriendsSnippetsListDto.input,
                response: currentUserFriendsSnippetsListDto.output,
                handler: async (req, res) => {
                    const userId = req.getRequestContext().activeUserId;
                    if (!userId) {
                        throw new ForbiddenError();
                    }

                    const result = await this.snippetService.getUserFriendsSnippets(
                        req.getRequestContext(),
                        userId,
                        req.query,
                    );

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/:userId/friends',
            ...defineRoutePipeline({
                before: [this.snippetReadLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: userFriendsSnippetsListDto.input.pick({ creator: true }).required(),
                query: userFriendsSnippetsListDto.input,
                response: userFriendsSnippetsListDto.output,
                handler: async (req, res) => {
                    const result = await this.snippetService.getUserFriendsSnippets(
                        req.getRequestContext(),
                        req.params.creator,
                        {
                            ...req.query,
                            creator: req.params.creator,
                        },
                    );

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/:id',
            ...defineRoutePipeline({
                before: [this.snippetReadLimiter],
                params: findOneSnippetDto.input,
                response: findOneSnippetDto.output,
                handler: async (req, res) => {
                    const result = await this.snippetService.findOne(req.getRequestContext(), req.params, {
                        creator: true,
                        collection: true,
                        tags: true,
                    });

                    const isOwner =
                        req.getRequestContext().activeUserId === result?.creator.user.id ? true : false;

                    if (!result || (!isOwner && result?.isPrivate)) {
                        throw new EntityNotFoundError({ entityName: 'Collection', entityId: req.params.id });
                    }

                    let finalResult;

                    if (result) {
                        finalResult = isOwner ? result : omit(result, ['isPrivate', 'updatedAt']);
                    }

                    res.status(200).json(finalResult);
                },
            }),
        );

        return router;
    }
}

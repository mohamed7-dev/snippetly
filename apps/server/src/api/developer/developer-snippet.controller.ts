import {
    createSnippetDto,
    currentUserSnippetListDto,
    currentUserTrashedSnippetListDto,
    deleteSnippetDto,
    findOneSnippetDto,
    forkSnippetDto,
    Permission,
    restoreSnippetDto,
    snippetListDto,
    updateSnippetDto,
    userFriendsSnippetsListDto,
} from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { EntityNotFoundError, ForbiddenError } from '../../common/errors/errors';
import { AppRouter } from '../../common/types/app-router.interface';
import { Developer } from '../../entities/developer/developer.entity';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { CollectionService } from '../../services/domain/collection.service';
import { DeveloperService } from '../../services/domain/developer.service';
import { SnippetService } from '../../services/domain/snippet.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';
import { RequestContext } from '../request-context/request-context';

@Controller({
    path: 'snippets',
    version: 1,
})
export class DeveloperSnippetController implements AppRouter {
    constructor(
        private readonly snippetService: SnippetService,
        private readonly developerService: DeveloperService,
        private readonly collectionService: CollectionService,
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
                before: [
                    this.snippetWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.CreateSnippet] }),
                ],
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
                before: [
                    this.snippetWriteLimiter,
                    authGuard({
                        permissions: [Permission.Owner],
                    }),
                ],
                body: updateSnippetDto.input.omit({ id: true }),
                params: updateSnippetDto.input.pick({ id: true }),
                response: updateSnippetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    if (!req.getRequestContext().activeUserId) {
                        throw new ForbiddenError();
                    }
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
                before: [
                    this.snippetWriteLimiter,
                    authGuard({
                        permissions: [Permission.Owner],
                    }),
                ],
                params: deleteSnippetDto.input,
                response: deleteSnippetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    if (!req.getRequestContext().activeUserId) {
                        throw new ForbiddenError();
                    }
                    const result = await this.snippetService.softDelete(req.getRequestContext(), req.params);
                    res.status(200).json(result);
                },
            }),
        );

        router.patch(
            '/:id/restore',
            ...defineRoutePipeline({
                before: [
                    this.snippetWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.Owner] }),
                ],
                params: restoreSnippetDto.input,
                response: restoreSnippetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.snippetService.restoreFromTrash(
                        req.getRequestContext(),
                        req.params,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        router.delete(
            '/:id/permanent',
            ...defineRoutePipeline({
                before: [
                    this.snippetWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.Owner] }),
                ],
                params: deleteSnippetDto.input,
                response: deleteSnippetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.snippetService.permanentlyDeleteFromTrash(
                        req.getRequestContext(),
                        req.params,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        router.post(
            '/:id/forks',
            ...defineRoutePipeline({
                before: [
                    this.snippetWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.ForkSnippet] }),
                ],
                params: forkSnippetDto.input.pick({ id: true }),
                body: forkSnippetDto.input.pick({ collectionId: true }),
                response: forkSnippetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.snippetService.fork(req.getRequestContext(), {
                        ...req.params,
                        ...req.body,
                    });
                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/',
            ...defineRoutePipeline({
                before: [this.snippetReadLimiter, authGuard({ permissions: [Permission.Public] })],
                query: snippetListDto.input,
                response: snippetListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(req.getRequestContext());
                    const shouldRestrictToPublic =
                        !req.query.creator || !developer || req.query.creator !== developer.id;

                    const canReadPrivateCollectionSnippets =
                        shouldRestrictToPublic &&
                        !req.query.creator &&
                        Boolean(
                            developer &&
                            req.query.collection &&
                            (await this.collectionService.isCollectionOwnedBy(
                                req.getRequestContext(),
                                req.query.collection,
                                developer.id,
                            )),
                        );

                    const restrictToPublic = shouldRestrictToPublic && !canReadPrivateCollectionSnippets;

                    const result = await this.snippetService.find(
                        req.getRequestContext(),
                        req.query,
                        {
                            collection: true,
                            tags: true,
                            creator: { user: true },
                            forkedFrom: { creator: { user: true } },
                        },
                        canReadPrivateCollectionSnippets && developer
                            ? {
                                  includePrivateSnippetsForCreatorId: developer.id,
                                  includePrivateSnippets: !restrictToPublic,
                              }
                            : {
                                  includePrivateSnippets: !restrictToPublic,
                              },
                    );

                    result.items = await this.snippetService.attachFavouriteStatus(
                        req.getRequestContext(),
                        result.items,
                    );

                    const response = restrictToPublic
                        ? {
                              ...result,
                              items: result.items.map(item =>
                                  omit(item, ['isPrivate', 'updatedAt', 'deletedAt', 'collection']),
                              ),
                          }
                        : result;
                    res.status(200).json(response);
                },
            }),
        );

        router.get(
            '/me',
            ...defineRoutePipeline({
                before: [
                    this.snippetReadLimiter,
                    authGuard({
                        permissions: [Permission.Authenticated, Permission.ReadSnippet, Permission.Owner],
                    }),
                ],
                query: currentUserSnippetListDto.input,
                response: currentUserSnippetListDto.output,
                handler: async (req, res) => {
                    const developer = await this.requireDeveloperForCurrentUser(req.getRequestContext());

                    const result = await this.snippetService.find(
                        req.getRequestContext(),
                        {
                            ...req.query,
                            creator: developer.id,
                        },
                        {
                            collection: true,
                            tags: true,
                            creator: { user: true },
                            forkedFrom: { creator: { user: true } },
                        },
                        { includePrivateSnippets: true },
                    );
                    result.items = await this.snippetService.attachFavouriteStatus(
                        req.getRequestContext(),
                        result.items,
                    );

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/trash',
            ...defineRoutePipeline({
                before: [
                    this.snippetReadLimiter,
                    authGuard({
                        permissions: [Permission.Authenticated, Permission.ReadSnippet, Permission.Owner],
                    }),
                ],
                query: currentUserTrashedSnippetListDto.input,
                response: currentUserTrashedSnippetListDto.output,
                handler: async (req, res) => {
                    const developer = await this.requireDeveloperForCurrentUser(req.getRequestContext());
                    const result = await this.snippetService.find(
                        req.getRequestContext(),
                        {
                            ...req.query,
                            creator: developer.id,
                        },
                        {
                            collection: true,
                            tags: true,
                            creator: { user: true },
                        },
                        { includePrivateSnippets: true, onlySoftDeleted: true },
                    );
                    result.items = await this.snippetService.attachFavouriteStatus(
                        req.getRequestContext(),
                        result.items,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/friends',
            ...defineRoutePipeline({
                before: [
                    this.snippetReadLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.ReadSnippet] }),
                ],
                query: userFriendsSnippetsListDto.input,
                response: userFriendsSnippetsListDto.output,
                handler: async (req, res) => {
                    const developer = await this.requireDeveloperForCurrentUser(req.getRequestContext());

                    const result = await this.snippetService.getUserFriendsSnippets(
                        req.getRequestContext(),
                        req.query.creator ?? developer.id,
                        req.query,
                    );
                    result.items = await this.snippetService.attachFavouriteStatus(
                        req.getRequestContext(),
                        result.items,
                    );

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/:id',
            ...defineRoutePipeline({
                before: [this.snippetReadLimiter, authGuard({ permissions: [Permission.Public] })],
                params: findOneSnippetDto.input,
                response: findOneSnippetDto.output,
                handler: async (req, res) => {
                    const result = await this.snippetService.findOne(
                        req.getRequestContext(),
                        req.params,
                        {
                            collection: true,
                            tags: true,
                            creator: { user: true },
                            forkedFrom: {
                                creator: { user: true },
                            },
                        },
                        { includePrivateSnippet: true, includeSoftDeleted: false },
                    );

                    const isOwner =
                        req.getRequestContext().activeUserId === result?.creator.user.id ? true : false;

                    if (!result || (!isOwner && result?.isPrivate)) {
                        throw new EntityNotFoundError({ entityName: 'Snippet', entityId: req.params.id });
                    }

                    let finalResult;

                    if (result) {
                        finalResult = isOwner
                            ? result
                            : omit(result, ['isPrivate', 'updatedAt', 'deletedAt', 'collection']);
                    }

                    const [resultWithFavouriteStatus] = await this.snippetService.attachFavouriteStatus(
                        req.getRequestContext(),
                        finalResult ? [finalResult] : [],
                    );

                    res.status(200).json(resultWithFavouriteStatus);
                },
            }),
        );

        return router;
    }

    private async requireDeveloperForCurrentUser(ctx: RequestContext): Promise<Developer> {
        const developer = await this.developerService.getActiveDeveloper(ctx, true);

        return developer;
    }
}

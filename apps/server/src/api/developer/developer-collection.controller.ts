import {
    collectionListDto,
    createCollectionDto,
    currentUserCollectionListDto,
    currentUserTrashedCollectionListDto,
    deleteCollectionDto,
    findOneCollectionDto,
    forkCollectionDto,
    Permission,
    restoreCollectionDto,
    updateCollectionDto,
} from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { isApiError } from '../../common/errors/api-error';
import { EntityNotFoundError, ForbiddenError } from '../../common/errors/errors';
import { AppRouter } from '../../common/types/app-router.interface';
import { Collection, Snippet } from '../../entities';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { CollectionService } from '../../services/domain/collection.service';
import { DeveloperService } from '../../services/domain/developer.service';
import { SnippetService } from '../../services/domain/snippet.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'collections',
    version: 1,
})
export class DeveloperCollectionController implements AppRouter {
    constructor(
        private readonly collectionService: CollectionService,
        private readonly developerService: DeveloperService,
        private readonly snippetService: SnippetService,
    ) {}

    collectionWriteLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
    });

    collectionReadLimiter = rateLimit({
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
                    this.collectionWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.CreateCollection] }),
                ],
                body: createCollectionDto.input,
                response: createCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.collectionService.create(req.getRequestContext(), req.body);
                    res.status(200).json(result);
                },
            }),
        );

        router.delete(
            '/:id',
            ...defineRoutePipeline({
                before: [
                    this.collectionWriteLimiter,
                    authGuard({
                        permissions: [Permission.Owner],
                    }),
                ],
                params: deleteCollectionDto.input,
                response: deleteCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    if (!req.getRequestContext().activeUserId) {
                        throw new ForbiddenError();
                    }
                    const result = await this.collectionService.softDelete(
                        req.getRequestContext(),
                        req.params,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        router.patch(
            '/:id/restore',
            ...defineRoutePipeline({
                before: [
                    this.collectionWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.Owner] }),
                ],
                params: restoreCollectionDto.input,
                response: restoreCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.collectionService.restoreFromTrash(
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
                    this.collectionWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.Owner] }),
                ],
                params: deleteCollectionDto.input,
                response: deleteCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.collectionService.permanentlyDeleteFromTrash(
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
                    this.collectionWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.ForkCollection] }),
                ],
                params: forkCollectionDto.input,
                response: forkCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.collectionService.fork(req.getRequestContext(), req.params);
                    if (isApiError(result)) return res.status(result.httpStatusCode).json(result);
                    res.status(200).json(result);
                },
            }),
        );

        router.patch(
            '/:id',
            ...defineRoutePipeline({
                before: [
                    this.collectionWriteLimiter,
                    authGuard({
                        permissions: [Permission.Owner],
                    }),
                ],
                body: updateCollectionDto.input.omit({ id: true }),
                params: updateCollectionDto.input.pick({ id: true }),
                response: updateCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    if (!req.getRequestContext().activeUserId) {
                        throw new ForbiddenError();
                    }
                    const result = await this.collectionService.update(req.getRequestContext(), {
                        ...req.params,
                        ...req.body,
                    });
                    res.status(200).json(result);
                },
            }),
        );

        // this is equivalent to discover and users' collections as well
        router.get(
            '/',
            ...defineRoutePipeline({
                before: [this.collectionReadLimiter, authGuard({ permissions: [Permission.Public] })],
                query: collectionListDto.input,
                response: collectionListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(req.getRequestContext());
                    const shouldRestrictToPublic =
                        !req.query.creator || !developer || req.query.creator !== developer.id;

                    let result = await this.collectionService.find(
                        req.getRequestContext(),
                        req.query,
                        {
                            creator: true,
                            tags: true,
                        },
                        { includePrivateCollections: !shouldRestrictToPublic },
                    );

                    const { snippetCountByCollection, snippetsByCollection } =
                        await this.collectionService.addSnippetsPreview(
                            req.getRequestContext(),
                            result.items,
                            { includePrivateSnippets: !shouldRestrictToPublic },
                        );

                    result = {
                        items: result.items.map(item => ({
                            ...item,
                            snippetCount: snippetCountByCollection.get(item.id) ?? 0,
                            snippets: snippetsByCollection.get(item.id) ?? [],
                        })) as Array<
                            Collection & {
                                snippetCount: number;
                                snippets: Pick<Snippet, 'name' | 'language' | 'id'>;
                            }
                        >,
                        itemsCount: result.itemsCount,
                    };

                    if (shouldRestrictToPublic) {
                        result.items = omit(result.items, ['isPrivate', 'updatedAt', 'deletedAt'], true);
                    }

                    result.items = await this.collectionService.attachFavouriteStatus(
                        req.getRequestContext(),
                        result.items,
                    );

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/me',
            ...defineRoutePipeline({
                before: [
                    this.collectionReadLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.ReadCollection] }),
                ],
                query: currentUserCollectionListDto.input,
                response: currentUserCollectionListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );

                    let result = await this.collectionService.find(
                        req.getRequestContext(),
                        {
                            ...req.query,
                            creator: developer.id,
                        },
                        { creator: true, tags: true },
                        { includePrivateCollections: true },
                    );

                    const { snippetCountByCollection, snippetsByCollection } =
                        await this.collectionService.addSnippetsPreview(
                            req.getRequestContext(),
                            result.items,
                            { includePrivateSnippets: true },
                        );

                    result = {
                        items: result.items.map(item => ({
                            ...item,
                            snippetCount: snippetCountByCollection.get(item.id) ?? 0,
                            snippets: snippetsByCollection.get(item.id) ?? [],
                        })) as Array<
                            Collection & {
                                snippetCount: number;
                                snippets: Pick<Snippet, 'name' | 'language' | 'id'>;
                            }
                        >,
                        itemsCount: result.itemsCount,
                    };

                    result.items = await this.collectionService.attachFavouriteStatus(
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
                    this.collectionReadLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.ReadCollection] }),
                ],
                query: currentUserTrashedCollectionListDto.input,
                response: currentUserTrashedCollectionListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const result = await this.collectionService.find(
                        req.getRequestContext(),
                        {
                            ...req.query,
                            creator: developer.id,
                        },
                        { creator: true, tags: true },
                        { includePrivateCollections: true, onlySoftDeleted: true },
                    );
                    const { snippetCountByCollection, snippetsByCollection } =
                        await this.collectionService.addSnippetsPreview(
                            req.getRequestContext(),
                            result.items,
                            { includePrivateSnippets: true },
                        );
                    const items = await this.collectionService.attachFavouriteStatus(
                        req.getRequestContext(),
                        result.items.map(item => ({
                            ...item,
                            snippetCount: snippetCountByCollection.get(item.id) ?? 0,
                            snippets: snippetsByCollection.get(item.id) ?? [],
                        })),
                    );
                    res.status(200).json({
                        items,
                        itemsCount: result.itemsCount,
                    });
                },
            }),
        );

        router.get(
            `/:id`,
            ...defineRoutePipeline({
                before: [this.collectionReadLimiter, authGuard({ permissions: [Permission.Public] })],
                params: findOneCollectionDto.input,
                response: findOneCollectionDto.output,
                handler: async (req, res) => {
                    const result = await this.collectionService.findOne(
                        req.getRequestContext(),
                        req.params,
                        {
                            creator: true,
                            tags: true,
                        },
                        { includePrivateCollection: true, includeSoftDeleted: false },
                    );

                    const isOwner =
                        req.getRequestContext().activeUserId === result?.creator.user.id ? true : false;

                    if (!result || (!isOwner && result?.isPrivate)) {
                        throw new EntityNotFoundError({ entityName: 'Collection', entityId: req.params.id });
                    }

                    const visibleCollection = isOwner
                        ? result
                        : omit(result, ['isPrivate', 'updatedAt', 'deletedAt']);

                    const snippetCountResult = await this.snippetService.countSnippetsInCollection(
                        req.getRequestContext(),
                        { collection: result },
                        { includePrivateSnippets: isOwner, includeSoftDeleted: false },
                    );

                    const collectionWithSnippetCount = {
                        ...visibleCollection,
                        snippetCount: snippetCountResult.snippetCount,
                    };
                    const [resultWithFavouriteStatus] = await this.collectionService.attachFavouriteStatus(
                        req.getRequestContext(),
                        [collectionWithSnippetCount],
                    );
                    res.status(200).json(resultWithFavouriteStatus);
                },
            }),
        );

        return router;
    }
}

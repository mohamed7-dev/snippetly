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
import { isApiError } from '../../common/errors/api-error';
import { EntityNotFoundError, ForbiddenError } from '../../common/errors/errors';
import { defineRateLimiter } from '../../common/helpers/define-rate-limiter';
import { AppRouter } from '../../common/types/app-router.interface';
import { ConfigService } from '../../config/config.service';
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
        private readonly configService: ConfigService,
    ) {}

    collectionWriteLimiter = defineRateLimiter(
        {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 50,
        },
        this.configService.apiOptions,
    );

    collectionReadLimiter = defineRateLimiter(
        {
            windowMs: 60 * 1000, // 1 minute
            max: 120,
        },
        this.configService.apiOptions,
    );

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
                before: [this.collectionWriteLimiter, authGuard({ permissions: [Permission.Owner] })],
                params: restoreCollectionDto.input,
                response: restoreCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    if (!req.getRequestContext().activeUserId) {
                        throw new ForbiddenError();
                    }
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
                    authGuard({ permissions: [Permission.Authenticated, Permission.CreateCollection] }),
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

                    const result = await this.collectionService.find(
                        req.getRequestContext(),
                        req.query,
                        {
                            creator: { user: true },
                            forkedFrom: { creator: { user: true } },
                            tags: true,
                        },
                        { includePrivateCollections: !shouldRestrictToPublic, includeSoftDeleted: false },
                    );

                    const [snippetsPreview, collectionsWithFavouriteStatus] = await Promise.all([
                        this.collectionService.getSnippetsPreviewForCollectionsList(
                            req.getRequestContext(),
                            result.items,
                            { includePrivateSnippets: !shouldRestrictToPublic },
                        ),
                        this.collectionService.attachFavouriteStatus(
                            req.getRequestContext(),
                            result.items,
                            developer,
                        ),
                    ]);

                    const finalResult = {
                        ...result,
                        items: result.items.map((item, index) => ({
                            ...item,
                            relationshipsWithCurrentUser: {
                                isFavouritedByCurrentUser:
                                    collectionsWithFavouriteStatus[index].isFavouritedByCurrentUser,
                            },
                            snippets: snippetsPreview.snippetsByCollection.get(item.id) ?? [],
                            snippetsCount: snippetsPreview.snippetCountByCollection.get(item.id) ?? 0,
                        })),
                    };

                    const response = shouldRestrictToPublic
                        ? {
                              ...finalResult,
                              items: finalResult.items.map(item =>
                                  omit(item, ['isPrivate', 'updatedAt', 'deletedAt']),
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

                    const result = await this.collectionService.find(
                        req.getRequestContext(),
                        {
                            ...req.query,
                            creator: developer.id,
                        },
                        { creator: { user: true }, forkedFrom: { creator: { user: true } }, tags: true },
                        { includePrivateCollections: true, includeSoftDeleted: false },
                    );

                    const [snippetsPreview, collectionsWithFavouriteStatus] = await Promise.all([
                        this.collectionService.getSnippetsPreviewForCollectionsList(
                            req.getRequestContext(),
                            result.items,
                            { includePrivateSnippets: true },
                        ),
                        this.collectionService.attachFavouriteStatus(
                            req.getRequestContext(),
                            result.items,
                            developer,
                        ),
                    ]);

                    const finalResult = {
                        ...result,
                        items: result.items.map((item, index) => ({
                            ...item,
                            relationshipsWithCurrentUser: {
                                isFavouritedByCurrentUser:
                                    collectionsWithFavouriteStatus[index].isFavouritedByCurrentUser,
                            },
                            snippets: snippetsPreview.snippetsByCollection.get(item.id) ?? [],
                            snippetsCount: snippetsPreview.snippetCountByCollection.get(item.id) ?? 0,
                        })),
                    };

                    res.status(200).json(finalResult);
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
                        { creator: { user: true }, tags: true },
                        { includePrivateCollections: true, onlySoftDeleted: true },
                    );

                    const [snippetsPreview, collectionsWithFavouriteStatus] = await Promise.all([
                        this.collectionService.getSnippetsPreviewForCollectionsList(
                            req.getRequestContext(),
                            result.items,
                            { includePrivateSnippets: true },
                        ),
                        this.collectionService.attachFavouriteStatus(
                            req.getRequestContext(),
                            result.items,
                            developer,
                        ),
                    ]);
                    const finalResult = {
                        ...result,
                        items: result.items.map((item, index) => ({
                            ...item,
                            relationshipsWithCurrentUser: {
                                isFavouritedByCurrentUser:
                                    collectionsWithFavouriteStatus[index].isFavouritedByCurrentUser,
                            },
                            snippets: snippetsPreview.snippetsByCollection.get(item.id) ?? [],
                            snippetsCount: snippetsPreview.snippetCountByCollection.get(item.id) ?? 0,
                        })),
                    };

                    res.status(200).json(finalResult);
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
                    const ctx = req.getRequestContext();
                    const result = await this.collectionService.findOne(
                        ctx,
                        req.params,
                        {
                            creator: { user: true },
                            forkedFrom: { creator: { user: true } },
                            tags: true,
                        },
                        { includePrivateCollection: true, includeSoftDeleted: false },
                    );

                    const isOwner = !!ctx.activeUserId && ctx.activeUserId === result?.creator.user.id;
                    const currentDeveloper = ctx.activeUserId
                        ? await this.developerService.getActiveDeveloper(ctx)
                        : undefined;

                    if (!result || (!isOwner && result?.isPrivate)) {
                        throw new EntityNotFoundError({ entityName: 'Collection', entityId: req.params.id });
                    }

                    const visibleCollection = isOwner
                        ? result
                        : omit(result, ['isPrivate', 'updatedAt', 'deletedAt']);

                    const [snippetCountResult, resultWithFavouriteStatus] = await Promise.all([
                        this.snippetService.countSnippetsInCollection(
                            ctx,
                            { collection: result },
                            { includePrivateSnippets: isOwner, includeSoftDeleted: false },
                        ),
                        this.collectionService.attachFavouriteStatus(ctx, [result], currentDeveloper),
                    ]);

                    const finalResult = {
                        ...visibleCollection,
                        snippetsCount: snippetCountResult.snippetCount,
                        relationshipsWithCurrentUser: {
                            isFavouritedByCurrentUser: resultWithFavouriteStatus[0].isFavouritedByCurrentUser,
                        },
                    };
                    res.status(200).json(finalResult);
                },
            }),
        );

        return router;
    }
}

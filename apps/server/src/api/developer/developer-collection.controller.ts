import {
    collectionListDto,
    createCollectionDto,
    deleteCollectionDto,
    findOneCollectionDto,
    forkCollectionDto,
    Permission,
    updateCollectionDto,
} from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { Router } from 'express';
import { EntityNotFoundError, ForbiddenError } from '../../common/errors/errors';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { CollectionService } from '../../services/domain/collection.service';
import { DeveloperService } from '../../services/domain/developer.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'developer/collections',
    version: 1,
})
export class DeveloperCollectionController implements AppRouter {
    constructor(
        private readonly collectionService: CollectionService,
        private readonly developerService: DeveloperService,
    ) {}
    initRoutes(router: Router): Router {
        router.post(
            '/',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Authenticated] })],
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
                before: [authGuard({ permissions: [Permission.Authenticated, Permission.Owner] })],
                params: deleteCollectionDto.input,
                response: deleteCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.collectionService.delete(req.getRequestContext(), req.params);
                    res.status(200).json(result);
                },
            }),
        );

        router.post(
            '/:id/forks',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Authenticated] })],
                params: forkCollectionDto.input,
                response: forkCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.collectionService.fork(req.getRequestContext(), req.params);
                    res.status(200).json(result);
                },
            }),
        );

        router.patch(
            '/:id',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Authenticated, Permission.Owner] })],
                body: updateCollectionDto.input.omit({ id: true }),
                params: updateCollectionDto.input.pick({ id: true }),
                response: updateCollectionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
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
                query: collectionListDto.input,
                response: collectionListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(req.getRequestContext());
                    const shouldRestrictToPublic =
                        !req.query.creator || !developer || req.query.creator !== developer.id;
                    const result = await this.collectionService.find(req.getRequestContext(), {
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
                before: [authGuard({ permissions: [Permission.Authenticated] })],
                query: collectionListDto.input.omit({ creator: true }),
                response: collectionListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(req.getRequestContext());
                    if (!developer) {
                        throw new ForbiddenError();
                    }

                    const result = await this.collectionService.find(req.getRequestContext(), {
                        ...req.query,
                        creator: developer.id,
                    });

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            `/:id`,
            ...defineRoutePipeline({
                params: findOneCollectionDto.input,
                response: findOneCollectionDto.output,
                handler: async (req, res) => {
                    const result = await this.collectionService.findOne(req.getRequestContext(), req.params, {
                        creator: true,
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

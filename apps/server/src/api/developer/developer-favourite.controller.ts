import {
    addFavouriteDto,
    favouriteCollectionsListDto,
    favouriteDevelopersListDto,
    favouriteSnippetsListDto,
    Permission,
    removeFavouriteDto,
} from '@snippetly/common/dto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { DeveloperService } from '../../services/domain/developer.service';
import { FavouriteService } from '../../services/domain/favourite.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'favourites',
    version: 1,
})
export class DeveloperFavouriteController implements AppRouter {
    constructor(
        private readonly favouriteService: FavouriteService,
        private readonly developerService: DeveloperService,
    ) {}

    private readonly readLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
    });

    private readonly writeLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
    });

    initRoutes(router: Router): Router {
        router.post(
            '/:resourceType/:id',
            ...defineRoutePipeline({
                before: [this.writeLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: addFavouriteDto.input,
                response: addFavouriteDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const result = await this.favouriteService.add(
                        req.getRequestContext(),
                        developer.id,
                        req.params.resourceType,
                        req.params.id,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        router.delete(
            '/:resourceType/:id',
            ...defineRoutePipeline({
                before: [this.writeLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: removeFavouriteDto.input,
                response: removeFavouriteDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const result = await this.favouriteService.remove(
                        req.getRequestContext(),
                        developer.id,
                        req.params.resourceType,
                        req.params.id,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/snippets',
            ...defineRoutePipeline({
                before: [this.readLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                query: favouriteSnippetsListDto.input,
                response: favouriteSnippetsListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const favourites = await this.favouriteService.listSnippets(
                        req.getRequestContext(),
                        developer.id,
                        req.query,
                    );
                    res.status(200).json(favourites);
                },
            }),
        );

        router.get(
            '/collections',
            ...defineRoutePipeline({
                before: [this.readLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                query: favouriteCollectionsListDto.input,
                response: favouriteCollectionsListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const favourites = await this.favouriteService.listCollections(
                        req.getRequestContext(),
                        developer.id,
                        req.query,
                    );
                    res.status(200).json(favourites);
                },
            }),
        );

        router.get(
            '/developers',
            ...defineRoutePipeline({
                before: [this.readLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                query: favouriteDevelopersListDto.input,
                response: favouriteDevelopersListDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const favourites = await this.favouriteService.listDevelopers(
                        req.getRequestContext(),
                        developer.id,
                        req.query,
                    );
                    res.status(200).json(favourites);
                },
            }),
        );

        return router;
    }
}

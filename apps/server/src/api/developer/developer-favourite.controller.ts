import {
    addFavouriteDto,
    favouriteCollectionsListDto,
    favouriteDevelopersListDto,
    favouriteSnippetsListDto,
    Permission,
    removeFavouriteDto,
} from '@snippetly/common/dto';
import { Router } from 'express';
import { defineRateLimiter } from '../../common/helpers/define-rate-limiter';
import { AppRouter } from '../../common/types/app-router.interface';
import { ConfigService } from '../../config/config.service';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { DeveloperService } from '../../services/domain/developer.service';
import { FavouriteService } from '../../services/domain/favourite.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';
import { RequestContext } from '../request-context/request-context';

@Controller({
    path: 'favourites',
    version: 1,
})
export class DeveloperFavouriteController implements AppRouter {
    constructor(
        private readonly favouriteService: FavouriteService,
        private readonly developerService: DeveloperService,
        private readonly configService: ConfigService,
    ) {}

    private readonly readLimiter = defineRateLimiter(
        {
            windowMs: 60 * 1000,
            max: 120,
        },
        this.configService.apiOptions,
    );

    private readonly writeLimiter = defineRateLimiter(
        {
            windowMs: 15 * 60 * 1000,
            max: 50,
        },
        this.configService.apiOptions,
    );

    initRoutes(router: Router): Router {
        router.post(
            '/:resourceType/:id',
            ...defineRoutePipeline({
                before: [
                    this.writeLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.CreateFavourite] }),
                ],
                params: addFavouriteDto.input,
                response: addFavouriteDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const developer = await this.requireActiveDeveloper(req.getRequestContext());
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
                before: [
                    this.writeLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.DeleteFavourite] }),
                ],
                params: removeFavouriteDto.input,
                response: removeFavouriteDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const developer = await this.requireActiveDeveloper(req.getRequestContext());
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
                before: [
                    this.readLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.ReadFavourite] }),
                ],
                query: favouriteSnippetsListDto.input,
                response: favouriteSnippetsListDto.output,
                handler: async (req, res) => {
                    const developer = await this.requireActiveDeveloper(req.getRequestContext());
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
                before: [
                    this.readLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.ReadFavourite] }),
                ],
                query: favouriteCollectionsListDto.input,
                response: favouriteCollectionsListDto.output,
                handler: async (req, res) => {
                    const developer = await this.requireActiveDeveloper(req.getRequestContext());
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
                before: [
                    this.readLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.ReadFavourite] }),
                ],
                query: favouriteDevelopersListDto.input,
                response: favouriteDevelopersListDto.output,
                handler: async (req, res) => {
                    const developer = await this.requireActiveDeveloper(req.getRequestContext());
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

    private async requireActiveDeveloper(ctx: RequestContext) {
        return await this.developerService.getActiveDeveloper(ctx, true);
    }
}

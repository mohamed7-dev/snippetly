import {
    activeDeveloperDto,
    deleteDeveloperAccountDto,
    developerListDto,
    findOneDeveloperDto,
    Permission,
    updateDeveloperAccountDto,
} from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { EntityNotFoundError, ForbiddenError, InternalServerError } from '../../common/errors/errors';
import { AppRouter } from '../../common/types/app-router.interface';
import { Developer } from '../../entities/developer/developer.entity';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { DeveloperService } from '../../services/domain/developer.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { RequestContext } from '../request-context/request-context';

@Controller({
    path: '/developer/developers',
    version: 1,
})
export class DeveloperDeveloperController implements AppRouter {
    constructor(private readonly developerService: DeveloperService) {}

    developerReadLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
    });

    developerWriteLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
    });

    initRoutes(router: Router): Router {
        // discover endpoint (always public dto)
        router.get(
            '/',
            ...defineRoutePipeline({
                before: [this.developerReadLimiter],
                query: developerListDto.input,
                response: developerListDto.output,
                handler: async (req, res) => {
                    const result = await this.developerService.find(req.getRequestContext(), {
                        ...req.query,
                        filter: {
                            ...req.query.filter,
                            isPrivate: { equals: false },
                        },
                    });

                    result.items = omit(result.items, ['isPrivate', 'updatedAt', 'deletedAt'], true);

                    res.status(200).json(result);
                },
            }),
        );

        router.get(
            '/me',
            ...defineRoutePipeline({
                before: [this.developerReadLimiter, authGuard({ permissions: [Permission.Owner] })],
                response: activeDeveloperDto.output,
                handler: async (req, res) => {
                    const userId = req.getRequestContext().activeUserId;
                    if (userId) {
                        const developer = await this.developerService.getOneByUserId(
                            req.getRequestContext(),
                            userId,
                        );
                        res.status(200).json(developer);
                    } else {
                        res.status(200).json(null);
                    }
                },
            }),
        );

        router.get(
            '/:id',
            ...defineRoutePipeline({
                before: [this.developerReadLimiter],
                params: findOneDeveloperDto.input,
                response: findOneDeveloperDto.output,
                handler: async (req, res) => {
                    const result = await this.developerService.findOne(
                        req.getRequestContext(),
                        req.params.id,
                    );

                    const isOwner = req.getRequestContext().activeUserId === result?.user.id ? true : false;

                    if (!result || (!isOwner && result?.isPrivate)) {
                        throw new EntityNotFoundError({ entityName: 'Developer', entityId: req.params.id });
                    }

                    let finalResult;

                    if (result) {
                        finalResult = isOwner
                            ? result
                            : omit(result, ['isPrivate', 'updatedAt', 'deletedAt']);
                    }

                    res.status(200).json(finalResult);
                },
            }),
        );

        router.patch(
            '/me',
            ...defineRoutePipeline({
                before: [
                    this.developerWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.Owner] }),
                ],
                body: updateDeveloperAccountDto.input,
                response: updateDeveloperAccountDto.output,
                handler: async (req, res) => {
                    const developer = await this.requireDeveloperForCurrentUser(req.getRequestContext());
                    const result = await this.developerService.update(req.getRequestContext(), {
                        ...req.body,
                        id: developer.id,
                    });

                    return res.status(200).json(result);
                },
            }),
        );

        router.delete(
            '/me',
            ...defineRoutePipeline({
                before: [
                    this.developerWriteLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.Owner] }),
                ],
                response: deleteDeveloperAccountDto.output,
                handler: async (req, res) => {
                    const developer = await this.requireDeveloperForCurrentUser(req.getRequestContext());
                    const result = await this.developerService.softDelete(
                        req.getRequestContext(),
                        developer.id,
                    );

                    return res.status(200).json(result);
                },
            }),
        );

        return router;
    }

    private async requireDeveloperForCurrentUser(ctx: RequestContext): Promise<Developer> {
        const userId = ctx.activeUserId;
        if (!userId) {
            throw new ForbiddenError();
        }
        const developer = await this.developerService.getOneByUserId(ctx, userId);
        if (!developer) {
            throw new InternalServerError('errors.current_user_has_no_developer_account');
        }
        return developer;
    }
}

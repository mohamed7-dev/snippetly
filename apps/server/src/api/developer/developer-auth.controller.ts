import {
    authenticateDeveloperDto,
    AuthenticateDeveloperDtoType,
    logoutDeveloperDto,
    LogoutDeveloperDto,
    Permission,
    registerDeveloperAccountDto,
} from '@snippetly/common/dto';
import { Router } from 'express';
import { isApiError } from '../../common/errors/api-error';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { AdministratorService } from '../../services/domain/administrator.service';
import { AuthService } from '../../services/domain/auth.service';
import { DeveloperService } from '../../services/domain/developer.service';
import { CommonAuth } from '../common/common-auth';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'developer/auth',
    version: 1,
})
export class DeveloperAuthController extends CommonAuth implements AppRouter {
    constructor(
        protected readonly authService: AuthService,
        protected readonly administratorService: AdministratorService,
        private readonly developerService: DeveloperService,
    ) {
        super(authService, administratorService);
    }

    initRoutes(router: Router): Router {
        router.post(
            '/register',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                body: registerDeveloperAccountDto.body,
                response: registerDeveloperAccountDto.response,
                interceptors: [transactionInterceptor()],
                handler: async (req, res, next) => {
                    const result = await this.developerService.registerAccount(
                        req.getRequestContext(),
                        req.body,
                    );
                    if (isApiError(result)) return next(result);
                    res.status(200).json(result);
                },
            }),
        );
        router.post(
            '/authenticate',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                body: authenticateDeveloperDto.body,
                response: authenticateDeveloperDto.response,
                interceptors: [transactionInterceptor()],
                handler: async (req, res, next) => {
                    const result = (await this.sharedAuthenticate(
                        req.getRequestContext(),
                        req.body,
                        req,
                        res,
                    )) satisfies AuthenticateDeveloperDtoType['response'];
                    if (isApiError(result)) return next(result);
                    res.status(200).json(result);
                },
            }),
        );

        router.post(
            '/logout',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                response: logoutDeveloperDto.response,
                interceptors: [transactionInterceptor()],
                handler: async (req, res, next) => {
                    const result = (await this.sharedLogout(
                        req.getRequestContext(),
                        req,
                        res,
                    )) satisfies LogoutDeveloperDto['response'];
                    if (isApiError(result)) return next(result);
                    res.status(200).json(result);
                },
            }),
        );

        return router;
    }
}

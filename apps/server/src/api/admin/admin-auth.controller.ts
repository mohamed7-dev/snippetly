import { authenticateAdminDto, logoutAdminDto, Permission } from '@snippetly/common/dto';
import { Router } from 'express';
import { isApiError } from '../../common/errors/api-error';
import { defineRateLimiter } from '../../common/helpers/define-rate-limiter';
import { AppRouter } from '../../common/types/app-router.interface';
import { ConfigService } from '../../config/config.service';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { AdministratorService } from '../../services/domain/administrator.service';
import { AuthService } from '../../services/domain/auth.service';
import { UserService } from '../../services/domain/user.service';
import { CommonAuth } from '../common/common-auth';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'auth',
    version: 1,
})
export class AdminAuthController extends CommonAuth implements AppRouter {
    constructor(
        protected readonly authService: AuthService,
        protected readonly administratorService: AdministratorService,
        protected readonly userService: UserService,
        protected readonly configService: ConfigService,
    ) {
        super(authService, administratorService, userService, configService);
    }

    loginLimiter = defineRateLimiter(
        {
            windowMs: 15 * 60 * 1000,
            max: 10,
        },
        this.configService.apiOptions,
    );

    sessionLimiter = defineRateLimiter(
        {
            windowMs: 15 * 60 * 1000,
            max: 30,
        },
        this.configService.apiOptions,
    );

    initRoutes(router: Router): Router {
        router.post(
            '/sessions',
            ...defineRoutePipeline({
                before: [this.loginLimiter, authGuard({ permissions: [Permission.Public] })],
                body: authenticateAdminDto.input,
                response: authenticateAdminDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.sharedAuthenticate(req.getRequestContext(), req.body, req, res);
                    if (isApiError(result)) return res.status(result.httpStatusCode).json(result);
                    res.status(200).json(result);
                },
            }),
        );
        router.delete(
            '/sessions/current',
            ...defineRoutePipeline({
                before: [this.sessionLimiter, authGuard({ permissions: [Permission.Public] })],
                response: logoutAdminDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res, next) => {
                    const result = await this.sharedLogout(req.getRequestContext(), req, res);
                    if (isApiError(result)) return next(result);
                    res.status(200).json(result);
                },
            }),
        );

        return router;
    }
}

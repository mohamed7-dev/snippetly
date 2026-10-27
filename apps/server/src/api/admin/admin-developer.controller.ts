import { createDeveloperDto, Permission } from '@snippetly/common/dto';
import { Router } from 'express';
import { isApiError } from '../../common/errors/api-error';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { DeveloperService } from '../../services/domain/developer.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'developers',
    version: 1,
})
export class AdminDeveloperController implements AppRouter {
    constructor(private readonly developerService: DeveloperService) {}
    initRoutes(router: Router): Router {
        router.post(
            '/',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Authenticated, Permission.CreateDeveloper] })],
                body: createDeveloperDto.input,
                response: createDeveloperDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.developerService.create(
                        req.getRequestContext(),
                        req.body,
                        req.body.password,
                    );
                    if (isApiError(result)) {
                        return res.status(result.httpStatusCode).json(result);
                    }

                    res.status(200).json(result);
                },
            }),
        );

        return router;
    }
}

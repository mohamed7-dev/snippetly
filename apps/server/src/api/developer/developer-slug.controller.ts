import { generateSlugForEntityDto, Permission } from '@snippetly/common/dto';
import { Router } from 'express';
import { defineRateLimiter } from '../../common/helpers/define-rate-limiter';
import { AppRouter } from '../../common/types/app-router.interface';
import { ConfigService } from '../../config/config.service';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { SlugService } from '../../services/helpers/slug.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';

@Controller({
    path: 'slugs',
    version: 1,
})
export class DeveloperSlugController implements AppRouter {
    constructor(
        private readonly slugService: SlugService,
        private readonly configService: ConfigService,
    ) {}

    readLimiter = defineRateLimiter(
        {
            windowMs: 60 * 1000, // 1 minute
            max: 120,
            standardHeaders: true,
            legacyHeaders: false,
        },
        this.configService.apiOptions,
    );

    initRoutes(router: Router): Router {
        router.put(
            '/',
            ...defineRoutePipeline({
                before: [this.readLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                interceptors: [transactionInterceptor()],
                body: generateSlugForEntityDto.input,
                response: generateSlugForEntityDto.output,
                handler: async (req, res) => {
                    const result = await this.slugService.slugForEntity(req.getRequestContext(), req.body);
                    res.status(200).json(result);
                },
            }),
        );
        return router;
    }
}

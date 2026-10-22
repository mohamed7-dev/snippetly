import { Permission, searchDto } from '@snippetly/common/dto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { SearchService } from '../../services/domain/search.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';

@Controller({
    path: 'search',
    version: 1,
})
export class DeveloperSearchController implements AppRouter {
    constructor(private readonly searchService: SearchService) {}

    searchReadLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
    });

    initRoutes(router: Router): Router {
        router.get(
            '/',
            ...defineRoutePipeline({
                before: [this.searchReadLimiter, authGuard({ permissions: [Permission.Public] })],
                query: searchDto.input,
                response: searchDto.output,
                handler: async (req, res) => {
                    const result = await this.searchService.search(req.getRequestContext(), req.query);
                    res.status(200).json(result);
                },
            }),
        );

        return router;
    }
}

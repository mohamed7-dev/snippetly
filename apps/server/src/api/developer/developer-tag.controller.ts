import { Permission, popularTagsDto } from '@snippetly/common/dto';
import { Router } from 'express';
import { defineRateLimiter } from '../../common/helpers/define-rate-limiter';
import { AppRouter } from '../../common/types/app-router.interface';
import { ConfigService } from '../../config/config.service';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { TagService } from '../../services/domain/tag.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';

@Controller({
    path: 'tags',
    version: 1,
})
export class DeveloperTagController implements AppRouter {
    constructor(
        private readonly tagService: TagService,
        private readonly configService: ConfigService,
    ) {}

    tagReadLimiter = defineRateLimiter(
        {
            windowMs: 60 * 1000, // 1 minute
            max: 120,
        },
        this.configService.apiOptions,
    );

    initRoutes(router: Router): Router {
        router.get(
            '/popular',
            ...defineRoutePipeline({
                before: [
                    this.tagReadLimiter,
                    authGuard({ permissions: [Permission.Authenticated, Permission.ReadTag] }),
                ],
                query: popularTagsDto.input,
                response: popularTagsDto.output,
                handler: async (req, res) => {
                    const tags = await this.tagService.getPopularTags(req.getRequestContext(), req.query);
                    res.status(200).json(tags);
                },
            }),
        );

        return router;
    }
}

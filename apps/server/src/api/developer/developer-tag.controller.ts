import { popularTagsDto } from '@snippetly/common/dto';
import { Router } from 'express';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { TagService } from '../../services/domain/tag.service';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';

@Controller({
    path: 'developer/tags',
    version: 1,
})
export class DeveloperTagController implements AppRouter {
    constructor(private readonly tagService: TagService) {}

    initRoutes(router: Router): Router {
        router.get(
            '/popular',
            ...defineRoutePipeline({
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

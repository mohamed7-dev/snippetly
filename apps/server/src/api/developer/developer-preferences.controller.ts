import { getDeveloperPreferencesDto, Permission, updateDeveloperPreferencesDto } from '@snippetly/common/dto';
import { Router } from 'express';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { DeveloperPreferencesService } from '../../services/domain/developer-preferences.service';
import { DeveloperService } from '../../services/domain/developer.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';

@Controller({
    path: 'preferences',
    version: 1,
})
export class DeveloperPreferencesController implements AppRouter {
    constructor(
        private readonly developerService: DeveloperService,
        private readonly developerPreferencesService: DeveloperPreferencesService,
    ) {}

    // TODO: define rate limiter

    initRoutes(router: Router): Router {
        router.get(
            '/me',
            ...defineRoutePipeline({
                before: [
                    authGuard({
                        permissions: [Permission.Authenticated, Permission.ReadDeveloperPreference],
                    }),
                ],
                response: getDeveloperPreferencesDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const result = await this.developerPreferencesService.get(
                        req.getRequestContext(),
                        developer.id,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        router.patch(
            '/me',
            ...defineRoutePipeline({
                before: [
                    authGuard({
                        permissions: [Permission.Authenticated, Permission.UpdateDeveloperPreference],
                    }),
                ],
                body: updateDeveloperPreferencesDto.input,
                response: updateDeveloperPreferencesDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const result = await this.developerPreferencesService.update(
                        req.getRequestContext(),
                        developer.id,
                        req.body,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        return router;
    }
}

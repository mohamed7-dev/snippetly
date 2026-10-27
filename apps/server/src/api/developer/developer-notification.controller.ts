import { dismissAppNotificationDto, listAppNotificationsDto, Permission } from '@snippetly/common/dto';
import { Router } from 'express';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { AppNotificationService } from '../../services/domain/app-notification.service';
import { DeveloperService } from '../../services/domain/developer.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';

@Controller({
    path: 'notifications',
    version: 1,
})
export class DeveloperNotificationController implements AppRouter {
    constructor(
        private readonly developerService: DeveloperService,
        private readonly appNotificationService: AppNotificationService,
    ) {}

    // TODO: define rate limiter

    initRoutes(router: Router): Router {
        router.get(
            '/',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Authenticated, Permission.ReadNotification] })],
                query: listAppNotificationsDto.input.unwrap(),
                response: listAppNotificationsDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const result = await this.appNotificationService.listForDeveloper(
                        req.getRequestContext(),
                        developer.id,
                        req.query,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        router.delete(
            '/:id',
            ...defineRoutePipeline({
                before: [
                    authGuard({ permissions: [Permission.Authenticated, Permission.DeleteNotification] }),
                ],
                params: dismissAppNotificationDto.input,
                response: dismissAppNotificationDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const result = await this.appNotificationService.dismiss(
                        req.getRequestContext(),
                        developer.id,
                        req.params,
                    );
                    res.status(200).json(result);
                },
            }),
        );

        return router;
    }
}

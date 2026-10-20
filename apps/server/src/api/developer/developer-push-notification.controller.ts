import {
    deletePushNotificationSubscriptionDto,
    getPushNotificationPublicKeyDto,
    Permission,
    savePushNotificationSubscriptionDto,
} from '@snippetly/common/dto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { DeveloperService } from '../../services/domain/developer.service';
import { PushNotificationService } from '../../services/domain/push-notification.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';

@Controller({
    path: 'push-notifications',
    version: 1,
})
export class DeveloperPushNotificationController implements AppRouter {
    constructor(
        private readonly developerService: DeveloperService,
        private readonly pushNotificationService: PushNotificationService,
    ) {}

    writeLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
    });

    initRoutes(router: Router): Router {
        router.get(
            '/public-key',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                response: getPushNotificationPublicKeyDto.output,
                handler: (_req, res) => {
                    res.status(200).json(this.pushNotificationService.getPublicKey());
                },
            }),
        );

        router.post(
            '/subscriptions',
            ...defineRoutePipeline({
                before: [this.writeLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                body: savePushNotificationSubscriptionDto.input,
                response: savePushNotificationSubscriptionDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const result = await this.pushNotificationService.saveSubscription(
                        req.getRequestContext(),
                        developer.id,
                        req.body,
                        req.get('user-agent'),
                    );
                    res.status(200).json(result);
                },
            }),
        );

        router.delete(
            '/subscriptions',
            ...defineRoutePipeline({
                before: [this.writeLimiter, authGuard({ permissions: [Permission.Authenticated] })],
                body: deletePushNotificationSubscriptionDto.input,
                response: deletePushNotificationSubscriptionDto.output,
                handler: async (req, res) => {
                    const developer = await this.developerService.getActiveDeveloper(
                        req.getRequestContext(),
                        true,
                    );
                    const result = await this.pushNotificationService.deleteSubscription(
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

import {
    DeletePushNotificationSubscriptionDtoType,
    GetPushNotificationPublicKeyDtoType,
    SavePushNotificationSubscriptionDtoType,
} from '@snippetly/common/dto';
import { In } from 'typeorm';
import webPush from 'web-push';
import { RequestContext } from '../../api/request-context/request-context';
import { InternalServerError, UserInputError } from '../../common/errors/errors';
import { ConfigService } from '../../config/config.service';
import { DeveloperPreferences } from '../../entities/developer-preferences/developer-preferences.entity';
import { Developer } from '../../entities/developer/developer.entity';
import { PushSubscription } from '../../entities/push-notifications/push-subscription.entity';
import { DatabaseService } from '../database/database.service';
import { EventBus } from '../event-bus/event-bus.service';
import { PushNotificationEvent } from '../event-bus/events/push-notification.event';
import { Injectable } from '../ioc-container/injectable.decorator';
import { Logger } from '../logger/logger';

export type PushNotificationPayload = {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    [key: string]: unknown;
};

@Injectable()
export class PushNotificationService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly eventBus: EventBus,
    ) {}

    public getPublicKey(): GetPushNotificationPublicKeyDtoType['output'] {
        return {
            publicKey: this.isConfigured()
                ? (this.configService.pushNotificationOptions.publicKey ?? null)
                : null,
        };
    }

    public async saveSubscription(
        ctx: RequestContext,
        developerId: string,
        input: SavePushNotificationSubscriptionDtoType['input'],
        userAgent?: string,
    ): Promise<{ success: true }> {
        if (!this.isConfigured()) {
            throw new InternalServerError('errors.push_notifications_not_configured');
        }
        if (!isSupportedPushEndpoint(input.endpoint)) {
            throw new UserInputError('errors.unsupported_endpoint');
        }

        const repo = this.databaseService.getRepository(ctx, PushSubscription);
        const existing = await repo.findOne({ where: { endpoint: input.endpoint } });
        const subscription =
            existing ??
            new PushSubscription({
                endpoint: input.endpoint,
            });
        subscription.p256dh = input.keys.p256dh;
        subscription.auth = input.keys.auth;
        subscription.userAgent = userAgent?.slice(0, 512) ?? null;
        subscription.developer = { id: developerId } as Developer;
        await repo.save(subscription);
        return { success: true };
    }

    public async deleteSubscription(
        ctx: RequestContext,
        developerId: string,
        input: DeletePushNotificationSubscriptionDtoType['input'],
    ): Promise<{ success: true }> {
        await this.databaseService.getRepository(ctx, PushSubscription).delete({
            endpoint: input.endpoint,
            developer: { id: developerId },
        });
        return { success: true };
    }

    public async sendToDevelopers(
        developerIds: string[],
        notification: PushNotificationPayload,
    ): Promise<void> {
        if (!developerIds.length) return;

        await this.eventBus.publish(new PushNotificationEvent(developerIds, notification));

        if (!this.isConfigured()) return;

        const developerPreferences = await this.databaseService.getRepository(DeveloperPreferences).find({
            where: { developer: { id: In(developerIds) } },
            relations: { developer: true },
        });

        const disabledDeveloperIds = new Set(
            developerPreferences
                .filter(({ preferences }) => preferences.isPushEnabled === false)
                .map(({ developer }) => developer.id),
        );
        const pushEnabledDeveloperIds = developerIds.filter(id => !disabledDeveloperIds.has(id));
        if (!pushEnabledDeveloperIds.length) return;

        const subscriptions = await this.databaseService
            .getRepository(PushSubscription)
            .find({ where: { developer: { id: In(pushEnabledDeveloperIds) } } });
        const options = this.configService.pushNotificationOptions;
        webPush.setVapidDetails(options.subject!, options.publicKey!, options.privateKey!);
        const failures: unknown[] = [];

        await Promise.all(
            subscriptions.map(async subscription => {
                try {
                    await webPush.sendNotification(
                        {
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: subscription.p256dh,
                                auth: subscription.auth,
                            },
                        },
                        JSON.stringify(notification),
                        { TTL: 60 * 60 },
                    );
                } catch (error) {
                    const statusCode = getPushStatusCode(error);
                    if (statusCode === 404 || statusCode === 410) {
                        await this.databaseService
                            .getRepository(PushSubscription)
                            .delete({ id: subscription.id });
                        return;
                    }

                    Logger.warn(
                        `Could not send push notification to subscription ${subscription.id}: ${
                            error instanceof Error ? error.message : 'Unknown push error.'
                        }`,
                        PushNotificationService.name,
                    );
                    failures.push(error);
                }
            }),
        );

        if (failures.length) {
            throw new InternalServerError('errors.could_not_push_notification_to_subscriptions', {
                failuresLength: failures.length,
            });
        }
    }

    private isConfigured(): boolean {
        const { publicKey, privateKey, subject } = this.configService.pushNotificationOptions;
        return !!(publicKey && privateKey && subject);
    }
}

function isSupportedPushEndpoint(endpoint: string): boolean {
    const { hostname, protocol } = new URL(endpoint);
    if (protocol !== 'https:') return false;

    const allowedHosts = [
        'fcm.googleapis.com',
        'push.services.mozilla.com',
        'notify.windows.com',
        'push.apple.com',
    ];
    return allowedHosts.some(host => hostname === host || hostname.endsWith(`.${host}`));
}

function getPushStatusCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined;
    return typeof error.statusCode === 'number' ? error.statusCode : undefined;
}

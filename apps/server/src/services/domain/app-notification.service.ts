import {
    SortDirection,
    type DismissAppNotificationDtoType,
    type ListAppNotificationsDtoType,
} from '@snippetly/common/dto';
import { IsNull } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { EntityNotFoundError } from '../../common/errors/errors';
import { OnApplicationBootstrap } from '../../common/types/lifecycle-hooks';
import type { ListQueryOptions } from '../../common/types/list-query-options';
import { DeveloperPreferences } from '../../entities/developer-preferences/developer-preferences.entity';
import { AppNotification } from '../../entities/notifications/app-notification.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { PushNotificationEvent } from '../../infra/event-bus/events/push-notification.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';

export type CreateAppNotificationInput = {
    title: string;
    body: string;
    url?: string;
    tag?: string;
};

@Injectable()
export class AppNotificationService implements OnApplicationBootstrap {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly listQueryBuilder: ListQueryBuilder,
        private readonly eventBus: EventBus,
    ) {}

    onApplicationBootstrap(): void {
        this.subscribeToPushNotificationEvent();
    }

    private subscribeToPushNotificationEvent() {
        this.eventBus.ofType(PushNotificationEvent).subscribe(event => {
            if (!event.developerIds.length || !event.notificationPayload) return;
            const { developerIds, notificationPayload } = event;
            void this.createForDevelopers(developerIds, notificationPayload);
        });
    }

    public async createForDevelopers(
        developerIds: string[],
        notification: CreateAppNotificationInput,
    ): Promise<void> {
        if (!developerIds.length) return;

        const rows = developerIds.map(developerId => ({
            developer: { id: developerId },
            title: notification.title,
            body: notification.body,
            url: notification.url ?? null,
            tag: notification.tag ?? null,
            dismissedAt: null,
        }));

        await this.databaseService
            .getRepository(AppNotification)
            .createQueryBuilder()
            .insert()
            .into(AppNotification)
            .values(rows)
            .orIgnore()
            .execute();
    }

    public async listForDeveloper(
        ctx: RequestContext,
        developerId: string,
        input: ListAppNotificationsDtoType['input'],
    ): Promise<ListAppNotificationsDtoType['output']> {
        const preferences = await this.databaseService.getRepository(ctx, DeveloperPreferences).findOne({
            where: { developer: { id: developerId } },
        });
        if (preferences?.preferences.inAppNotificationsEnabled === false) {
            return { items: [], itemsCount: 0 };
        }

        const listOptions: ListQueryOptions<AppNotification> = {
            ...input,
            take: input?.take ?? 20,
            skip: input?.skip ?? 0,
            sort: input?.sort ?? { createdAt: SortDirection.DESC, id: SortDirection.DESC },
        } as ListQueryOptions<AppNotification>;

        const query = this.listQueryBuilder.build(AppNotification, listOptions, {
            ctx,
            alias: 'notification',
            where: { developer: { id: developerId }, dismissedAt: IsNull() },
        });
        const [notifications, itemsCount] = await query.getManyAndCount();

        return {
            items: notifications,
            itemsCount,
        };
    }

    public async dismiss(
        ctx: RequestContext,
        developerId: string,
        input: DismissAppNotificationDtoType['input'],
    ): Promise<{ success: true }> {
        const notification = await this.databaseService.getRepository(ctx, AppNotification).findOne({
            where: { id: input.id, developer: { id: developerId } },
        });
        if (!notification) {
            throw new EntityNotFoundError({ entityName: 'AppNotification', entityId: input.id });
        }

        if (!notification.dismissedAt) {
            notification.dismissedAt = new Date();
            await this.databaseService.getRepository(ctx, AppNotification).save(notification);
        }

        return { success: true };
    }
}

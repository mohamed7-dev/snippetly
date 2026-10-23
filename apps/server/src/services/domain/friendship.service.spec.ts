import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../entities/developer/developer.entity', () => ({ Developer: class Developer {} }));
vi.mock('../../entities/friendships/friendship.entity', () => ({ Friendship: class Friendship {} }));
vi.mock('../../entities/snippets/snippet.entity', () => ({ Snippet: class Snippet {} }));

import { StdoutLoggerStrategy } from '../../config/system/logger/stdout-logger.strategy';
import { Friendship } from '../../entities/friendships/friendship.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { AppJobEvent } from '../../infra/event-bus/events/app-job.event';
import { FriendshipEvent } from '../../infra/event-bus/events/friendship.event';
import { JobQueue } from '../../infra/job-queue/job-qeueue.service';
import { Logger } from '../../infra/logger/logger';
import { PushNotificationService } from '../../infra/push-notification/push-notification.service';
import { FriendshipService } from './friendship.service';

describe('FriendshipService job notifications', () => {
    let eventBus: EventBus;
    let service: FriendshipService;
    let enqueue: ReturnType<typeof vi.fn>;
    let sendToDevelopers: ReturnType<typeof vi.fn>;
    let databaseService: Pick<DatabaseService, 'getRepository'>;

    beforeEach(() => {
        Logger.useLogger(new StdoutLoggerStrategy());
        eventBus = new EventBus();
        enqueue = vi.fn().mockResolvedValue(undefined);
        sendToDevelopers = vi.fn().mockResolvedValue(undefined);
        databaseService = {
            getRepository: vi.fn().mockReturnValue({
                findOne: vi.fn().mockResolvedValue({
                    id: 'actor-id',
                    firstName: 'Ada',
                    lastName: 'Lovelace',
                }),
            }),
        };
        service = new FriendshipService(
            databaseService as DatabaseService,
            {} as never,
            eventBus,
            { enqueue } as unknown as JobQueue,
            { sendToDevelopers } as unknown as PushNotificationService,
        );
        service.onApplicationBootstrap();
    });

    it('enqueues notifications for friendship request lifecycle events', async () => {
        const event = new FriendshipEvent({} as never, {} as Friendship, 'sent', {
            requesterId: 'requester-id',
            addresseeId: 'addressee-id',
            actorId: 'requester-id',
        });

        await eventBus.publish(event);

        expect(enqueue).toHaveBeenCalledWith(
            {
                type: 'notify-friendship-change',
                eventType: 'sent',
                requesterId: 'requester-id',
                addresseeId: 'addressee-id',
                actorId: 'requester-id',
            },
            10,
        );
    });

    it.each([
        ['sent', 'addressee-id', '/dashboard/requests'],
        ['cancelled', 'addressee-id', '/dashboard/requests'],
        ['accepted', 'requester-id', '/dashboard/friends'],
        ['rejected', 'requester-id', '/dashboard/friends'],
    ] as const)(
        'sends a %s notification to the other participant',
        async (eventType, expectedRecipientId, expectedUrl) => {
            await eventBus.publish(
                new AppJobEvent({
                    type: 'notify-friendship-change',
                    eventType,
                    requesterId: 'requester-id',
                    addresseeId: 'addressee-id',
                    actorId: 'actor-id',
                }),
            );

            expect(sendToDevelopers).toHaveBeenCalledWith(
                [expectedRecipientId],
                expect.objectContaining({
                    url: expectedUrl,
                    tag: `friendship-${eventType}-requester-id-addressee-id`,
                }),
            );
        },
    );
});

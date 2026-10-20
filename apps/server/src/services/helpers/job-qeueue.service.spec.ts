import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../config/config.service';
import { StdoutLoggerStrategy } from '../../config/system/logger/stdout-logger.strategy';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { Logger } from '../../infra/logger/logger';
import { AppJobEvent } from '../events/app-job.event';
import { AppJob } from '../jobs/app-job';
import { JobQueue } from './job-qeueue.service';

describe('JobQueue', () => {
    let eventBus: EventBus;
    let queue: JobQueue;

    beforeEach(() => {
        Logger.useLogger(new StdoutLoggerStrategy());
        eventBus = new EventBus();
        const configService = {
            systemOptions: {
                jobQueueStrategy: {
                    enqueue: vi.fn().mockResolvedValue(undefined),
                    verifyWebhook: vi.fn().mockResolvedValue(true),
                },
            },
        } as unknown as ConfigService;
        queue = new JobQueue(configService, eventBus);
    });

    it('publishes jobs as events and waits for synchronous domain handlers', async () => {
        const job: AppJob = {
            type: 'notify-friends-of-published-snippet',
            authorId: 'author-id',
            snippetId: 'snippet-id',
        };
        const handler = vi.fn().mockResolvedValue(undefined);
        eventBus.registerSyncHandler({
            event: AppJobEvent,
            id: 'test-job-handler',
            handler,
        });

        await queue.run(job);

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.calls[0][0].job).toEqual(job);
    });

    it('propagates job handler failures so the webhook queue can retry', async () => {
        const error = new Error('Job failed');
        eventBus.registerSyncHandler({
            event: AppJobEvent,
            id: 'failing-test-job-handler',
            handler: () => {
                throw error;
            },
        });

        await expect(
            queue.run({
                type: 'notify-friends-of-published-snippet',
                authorId: 'author-id',
                snippetId: 'snippet-id',
            }),
        ).rejects.toBe(error);
    });
});

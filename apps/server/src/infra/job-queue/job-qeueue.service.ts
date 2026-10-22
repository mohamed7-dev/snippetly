import { ConfigService } from '../../config/config.service';
import { JobQueueStrategy } from '../../config/system/job-queue/job-queue-strategy.interface';
import { EventBus } from '../event-bus/event-bus.service';
import { AppJobEvent } from '../event-bus/events/app-job.event';
import { Injectable } from '../ioc-container/injectable.decorator';
import { AppJob } from './types';

@Injectable()
export class JobQueue {
    private jobQueueStrategy: JobQueueStrategy;

    constructor(
        private readonly configService: ConfigService,
        private readonly eventBus: EventBus,
    ) {
        this.jobQueueStrategy = this.configService.systemOptions.jobQueueStrategy;
    }

    /**
     * @description
     * Adds a job to the configured queue with the requested delay.
     */
    public async enqueue(job: AppJob, delaySeconds: number) {
        return await this.jobQueueStrategy.enqueue(job, delaySeconds);
    }

    /**
     * @description
     * Checks whether a webhook signature is valid for the raw request body.
     */
    public async verifyWebhook(signature: string, rawBody: string) {
        return await this.jobQueueStrategy.verifyWebhook(signature, rawBody);
    }

    /**
     * @description
     * Publishes a job event so the registered job handlers can process the job.
     */
    public async run(job: AppJob): Promise<void> {
        await this.eventBus.publish(new AppJobEvent(job));
    }

    /**
     * @description
     * Checks whether a value has the required fields for one of the supported job types.
     */
    public isAppJob(value: unknown): value is AppJob {
        if (typeof value !== 'object' || value === null || !('type' in value)) return false;
        switch (value.type) {
            case 'delete-developer-account':
                return (
                    'userId' in value &&
                    typeof value.userId === 'string' &&
                    value.userId.length > 0 &&
                    'deleteAfter' in value &&
                    typeof value.deleteAfter === 'number' &&
                    Number.isFinite(value.deleteAfter)
                );
            case 'copy-collection-snippets':
                return (
                    'sourceCollectionId' in value &&
                    typeof value.sourceCollectionId === 'string' &&
                    value.sourceCollectionId.length > 0 &&
                    'targetCollectionId' in value &&
                    typeof value.targetCollectionId === 'string' &&
                    value.targetCollectionId.length > 0 &&
                    'developerId' in value &&
                    typeof value.developerId === 'string' &&
                    value.developerId.length > 0
                );
            case 'notify-friends-of-published-snippet':
                return (
                    'authorId' in value &&
                    typeof value.authorId === 'string' &&
                    value.authorId.length > 0 &&
                    'snippetId' in value &&
                    typeof value.snippetId === 'string' &&
                    value.snippetId.length > 0
                );
            case 'notify-friendship-change':
                return (
                    'eventType' in value &&
                    (value.eventType === 'sent' ||
                        value.eventType === 'accepted' ||
                        value.eventType === 'cancelled' ||
                        value.eventType === 'rejected') &&
                    'requesterId' in value &&
                    typeof value.requesterId === 'string' &&
                    value.requesterId.length > 0 &&
                    'addresseeId' in value &&
                    typeof value.addresseeId === 'string' &&
                    value.addresseeId.length > 0 &&
                    'actorId' in value &&
                    typeof value.actorId === 'string' &&
                    value.actorId.length > 0
                );
            case 'send-account-welcome-email':
            case 'send-account-goodbye-email':
                return 'userId' in value && typeof value.userId === 'string' && value.userId.length > 0;
            default:
                return false;
        }
    }
}

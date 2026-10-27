import { Logger } from '../../../infra/logger/logger';
import { JobQueueStrategy } from './job-queue-strategy.interface';

const CONTEXT_NAME = 'JobQueue';

export class DummyJobQueueStrategy implements JobQueueStrategy {
    readonly enqueuedJobs: Array<{ job: unknown; delaySeconds: number }> = [];

    enqueue(job: unknown, delaySeconds = 0): Promise<void> {
        Logger.debug(`Enqueueing Job ${'\n' + JSON.stringify(job) + '\n'}`, CONTEXT_NAME);
        this.enqueuedJobs.push({ job, delaySeconds });
        return Promise.resolve();
    }

    verifyWebhook(): Promise<boolean> {
        Logger.debug(`Verifying Webhook`, CONTEXT_NAME);

        return Promise.resolve(true);
    }
}

import { ConfigService } from '../../config/config.service';
import { JobQueueStrategy } from '../../config/system/job-queue/job-queue-strategy.interface';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { AppJobEvent } from '../events/app-job.event';
import type { AppJob } from '../jobs/app-job';

@Injectable()
export class JobQueue {
    private jobQueueStrategy: JobQueueStrategy;
    constructor(
        private readonly configService: ConfigService,
        private readonly eventBus: EventBus,
    ) {
        this.jobQueueStrategy = this.configService.systemOptions.jobQueueStrategy;
    }

    public async enqueue(job: AppJob, delaySeconds: number) {
        return await this.jobQueueStrategy.enqueue(job, delaySeconds);
    }

    public async verifyWebhook(signature: string, rawBody: string) {
        return await this.jobQueueStrategy.verifyWebhook(signature, rawBody);
    }

    public async run(job: AppJob): Promise<void> {
        await this.eventBus.publish(new AppJobEvent(job));
    }
}

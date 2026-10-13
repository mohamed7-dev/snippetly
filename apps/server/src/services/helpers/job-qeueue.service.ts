import { ConfigService } from '../../config/config.service';
import { JobQueueStrategy } from '../../config/system/job-queue/job-queue-strategy.interface';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

export type AppJob =
    | {
          type: 'delete-developer-account';
          userId: string;
          deleteAfter: number;
      }
    | {
          type: 'copy-collection-snippets';
          sourceCollectionId: string;
          targetCollectionId: string;
          developerId: string;
      };

@Injectable()
export class JobQueue {
    private jobQueueStrategy: JobQueueStrategy;
    constructor(private readonly configService: ConfigService) {
        this.jobQueueStrategy = this.configService.systemOptions.jobQueueStrategy;
    }

    public async enqueue(job: AppJob, delaySeconds: number) {
        return await this.jobQueueStrategy.enqueue(job, delaySeconds);
    }

    public async verifyWebhook(signature: string, rawBody: string) {
        return await this.jobQueueStrategy.verifyWebhook(signature, rawBody);
    }
}

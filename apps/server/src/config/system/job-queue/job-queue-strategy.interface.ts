import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy.interface';

export interface JobQueueStrategy extends LifecycleStrategy {
    enqueue(job: unknown, delaySeconds?: number): Promise<void>;
    verifyWebhook(signature: string, rawBody: string): Promise<boolean>;
}

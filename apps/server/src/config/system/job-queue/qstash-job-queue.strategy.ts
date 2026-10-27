import { Client, Receiver, SignatureError } from '@upstash/qstash';
import { JobQueueStrategy } from './job-queue-strategy.interface';

export interface QStashJobQueueOptions {
    token?: string;
    callbackUrl?: string;
    currentSigningKey?: string;
    nextSigningKey?: string;
    url?: string;
}

export class QStashJobQueueStrategy implements JobQueueStrategy {
    private readonly client?: Client;
    private readonly receiver?: Receiver;

    constructor(private readonly options: QStashJobQueueOptions) {
        if (options.token) {
            this.client = new Client({ token: options.token, baseUrl: options.url });
        }
        if (options.currentSigningKey && options.nextSigningKey) {
            this.receiver = new Receiver({
                currentSigningKey: options.currentSigningKey,
                nextSigningKey: options.nextSigningKey,
            });
        }
    }

    async enqueue(job: unknown, delaySeconds = 0): Promise<void> {
        if (!this.client || !this.options.callbackUrl) {
            throw new Error('QStash requires QSTASH_TOKEN and QSTASH_JOBS_CALLBACK_URL to enqueue jobs');
        }

        await this.client.publishJSON({
            url: this.options.callbackUrl,
            body: job,
            ...(delaySeconds > 0 ? { notBefore: Math.floor(Date.now() / 1000) + delaySeconds } : {}),
        });
    }

    async verifyWebhook(signature: string, rawBody: string): Promise<boolean> {
        if (!this.receiver || !this.options.callbackUrl) {
            throw new Error(
                'QStash webhook verification requires QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY, and QSTASH_JOBS_CALLBACK_URL',
            );
        }

        try {
            return await this.receiver.verify({
                signature,
                body: rawBody,
                url: this.options.callbackUrl,
            });
        } catch (error) {
            if (error instanceof SignatureError) return false;
            throw error;
        }
    }
}

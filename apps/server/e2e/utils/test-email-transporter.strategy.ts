import { EmailTransporterStrategy, SendEmailOptions } from '@snippetly/server';

export class TestEmailTransporter implements EmailTransporterStrategy {
    constructor(private sendEmailFn: (options: SendEmailOptions) => Promise<SendEmailOptions>) {}
    async sendEmail(options: SendEmailOptions): Promise<{ done: true }> {
        await this.sendEmailFn?.(options);
        return new Promise(resolve => resolve({ done: true }));
    }
}

import { Logger } from '../../../infra/logger/logger';
import { EmailTransporterStrategy, SendEmailOptions } from './email-transporter-strategy.interface';

export class DummyEmailTransporterStrategy implements EmailTransporterStrategy {
    readonly sentEmails: SendEmailOptions[] = [];

    public async sendEmail(options: SendEmailOptions): Promise<void> {
        Logger.debug(`Sent email address: ${'\n' + JSON.stringify(options)}`, 'EmailTransporter');
        this.sentEmails.push(options);
        return Promise.resolve();
    }
}

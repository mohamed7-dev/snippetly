import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy.interface';
import { AppEvent } from '../../../infra/event-bus/app-event';

export interface SendEmailOptions {
    event: AppEvent;
    from: string;
    to: string;
    subject: string;
    html: string;
}

export interface EmailTransporterStrategy extends LifecycleStrategy {
    sendEmail(options: SendEmailOptions): Promise<unknown>;
}

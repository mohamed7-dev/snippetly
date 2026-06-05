import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy.interface';

export interface SendEmailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

export interface EmailTransporterStrategy extends LifecycleStrategy {
    sendEmail<Result = any>(options: SendEmailOptions): Promise<Result>;
}

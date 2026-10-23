import { ConfigService } from '../../config/config.service';
import { SendEmailOptions } from '../../config/system/email/email-transporter-strategy.interface';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

@Injectable()
export class EmailClient {
    constructor(private readonly configService: ConfigService) {}

    /**
     * @description
     * Sends an email using the configured transporter and sender address.
     */
    async sendEmail<Result = any>(options: Omit<SendEmailOptions, 'from'>): Promise<Result> {
        const { emailTransporterStrategy, from } = this.configService.systemOptions.email;

        return (await emailTransporterStrategy.sendEmail({
            ...options,
            from,
        })) as Result;
    }
}

import { ConfigService } from '../../config';
import { SendEmailOptions } from '../../config/system/email/email-transporter-strategy.interface';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

@Injectable()
export class EmailClient {
    constructor(private readonly configService: ConfigService) {}

    async sendEmail<Result = any>(options: Omit<SendEmailOptions, 'from'>): Promise<Result> {
        const { emailTransporterStrategy, from } = this.configService.systemOptions.email;

        // accessing process.env here is anti pattern because this tightly couples the service to
        // the nodemailer implementation
        return (await emailTransporterStrategy.sendEmail({
            ...options,
            from,
        })) as Result;
    }
}

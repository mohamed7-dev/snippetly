import nodemailer, { Transporter } from 'nodemailer';
import { EmailTransporterStrategy, SendEmailOptions } from './email-transporter-strategy.interface';

interface NodemailerStrategyOptions {
    email: string;
    password: string;
}

export class NodemailerStrategy implements EmailTransporterStrategy {
    private transporter: Transporter;

    constructor(private options: NodemailerStrategyOptions) {}

    onInit(): void | Promise<void> {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: this.options.email,
                pass: this.options.password,
            },
        });
    }

    public async sendEmail<Result = any>(options: SendEmailOptions): Promise<Result> {
        // we know the response is coming from gmail so we can strongly type the Result
        return await this.transporter.sendMail(options);
    }
}

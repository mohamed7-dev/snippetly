import { RequestContext } from '../../api/request-context/request-context';
import { ConfigService } from '../../config/config.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

@Injectable()
export class VerificationTokenGenerator {
    constructor(private configService: ConfigService) {}

    /**
     * @description
     * Generates a verification token using the configured token strategy.
     */
    async generateVerificationToken(ctx: RequestContext): Promise<string> {
        return await this.configService.authOptions.verificationTokenStrategy.generateVerificationToken(ctx);
    }

    /**
     * @description
     * Verifies a verification token using the configured token strategy.
     */
    async verifyVerificationToken(ctx: RequestContext, token: string): Promise<boolean> {
        return await this.configService.authOptions.verificationTokenStrategy.verifyVerificationToken(
            ctx,
            token,
        );
    }
}

import { RequestContext } from '../../api/request-context/request-context';
import { ConfigService } from '../../config/config.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

@Injectable()
export class PasswordValidationService {
    constructor(private readonly configService: ConfigService) {}
    /**
     * @description
     * Validates a password using the configured validation strategy.
     */
    public async validate(ctx: RequestContext, password: string): Promise<boolean | string> {
        return await this.configService.authOptions.passwordValidationStrategy.validate(ctx, password);
    }
}

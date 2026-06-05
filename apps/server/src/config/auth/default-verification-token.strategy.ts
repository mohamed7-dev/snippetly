import ms from 'ms';
import { RequestContext } from '../../api/request-context/request-context';
import { generatePublicId } from '../../common/helpers/generate-public-id';
import { ModuleRef } from '../../infra/ioc-container/module-ref.service';
import { ConfigService } from '../config.service';
import { VerificationTokenStrategy } from './verification-token-strategy.interface';

export class DefaultVerificationTokenStrategy implements VerificationTokenStrategy {
    private configService: ConfigService;

    init(moduleRef: ModuleRef) {
        this.configService = moduleRef.getProvider(ConfigService);
    }

    generateVerificationToken(_ctx: RequestContext): string {
        const base64Now = Buffer.from(new Date().toJSON()).toString('base64');
        const id = generatePublicId();
        return `${base64Now}_${id}`;
    }

    verifyVerificationToken(_ctx: RequestContext, token: string): boolean {
        const { verificationTokenDuration } = this.configService.authOptions;
        const tokenDurationInMs =
            typeof verificationTokenDuration === 'string'
                ? ms(verificationTokenDuration)
                : verificationTokenDuration;
        const [generatedAt] = token.split('_');
        if (generatedAt) {
            const dateString = Buffer.from(generatedAt, 'base64').toString();
            const date = new Date(dateString);
            const elapsed = Date.now() - +date;
            return elapsed < tokenDurationInMs;
        }
        return false;
    }
}

import { RequestContext } from '../../api/request-context/request-context';
import { LifecycleStrategy } from '../../common/types/lifecycle-strategy.interface';

export interface VerificationTokenStrategy extends LifecycleStrategy {
    generateVerificationToken(ctx: RequestContext): Promise<string> | string;
    verifyVerificationToken(ctx: RequestContext, token: string): Promise<boolean> | boolean;
}

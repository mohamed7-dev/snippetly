import { RequestContext } from '../../api/request-context/request-context';

export interface PasswordValidationStrategy {
    validate(ctx: RequestContext, password: string): Promise<boolean | string> | boolean | string;
}

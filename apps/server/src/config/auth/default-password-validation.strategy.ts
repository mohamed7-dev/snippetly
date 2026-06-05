import { PasswordValidationStrategy } from './password-validation-strategy.interface';

interface DefaultPasswordValidationStrategyOptions {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}

export class DefaultPasswordValidationStrategy implements PasswordValidationStrategy {
    constructor(private readonly options?: DefaultPasswordValidationStrategyOptions) {}
    validate(_ctx: any, password: string): boolean | string {
        const { minLength, maxLength, pattern } = this.options || {};
        if (minLength) {
            if (password.length < minLength) {
                return 'Password must be at least ' + minLength + ' characters long';
            }
        }
        if (maxLength) {
            if (password.length > maxLength) {
                return 'Password must be at most ' + maxLength + ' characters long';
            }
        }
        if (pattern) {
            if (!pattern.test(password)) {
                return 'Password does not meet the required pattern';
            }
        }
        return true;
    }
}

import { PasswordValidationStrategy, RequestContext } from '@snippetly/server';

export class TestPasswordValidationStrategy implements PasswordValidationStrategy {
    validate(_: RequestContext, password: string): boolean | string {
        if (password === 'test') {
            // when seeding data, we have used test as password
            // so it should be allowed
            return true;
        }
        if (password.length < 8) {
            return 'Password must be more than 8 characters';
        }
        if (password === '12345678') {
            return "Don't use 12345678!";
        }
        return true;
    }
}

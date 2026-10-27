import { LifecycleStrategy } from '../../common/types/lifecycle-strategy.interface';
import { User } from '../../entities/users/user.entity';

export interface AuthenticationStrategy<Data = unknown> extends LifecycleStrategy {
    readonly name: string;
    defineZodSchemaSource(): string;
    authenticate(ctx: any, data: Data): Promise<User | string | false>;
    onLogout?(ctx: any, user: User): Promise<void>;
}

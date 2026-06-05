import { LifecycleStrategy } from '../../common/types/lifecycle-strategy.interface';

export interface PasswordHashingStrategy extends LifecycleStrategy {
    hash(plain: string): Promise<string>;
    verify(plain: string, hash: string): Promise<boolean>;
}

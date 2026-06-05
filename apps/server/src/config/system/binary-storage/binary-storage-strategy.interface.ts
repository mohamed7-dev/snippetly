import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy.interface';

export interface BinaryStorageStrategy extends LifecycleStrategy {
    upload(): Promise<void>;
}

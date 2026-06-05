import { ModuleRef } from '../../infra/ioc-container/module-ref.service';

/**
 * @description
 * LifecycleStrategy defines a contract for injectable strategies
 * that can be hooked into the app lifecycle.
 */
export interface LifecycleStrategy {
    /**
     * Called while the application being bootstrapped.
     * Receives the {@link ModuleRef} so the strategy can resolve dependencies if needed.
     */
    onInit?(moduleRef: ModuleRef): void | Promise<void>;

    /**
     * Called before application shutdown.
     * Gives the strategy the chance to cleanup resources (e.g., caches, connections).
     */
    onDestroy?(): void | Promise<void>;
}

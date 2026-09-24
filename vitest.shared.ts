import { getE2ETestTimeout, isTestRunningInCIEnv } from './e2e-common/e2e-common-utils';
/**
 * @description
 * Shared vitest configuration for all test suites throughout the workspace.
 *
 * - `testTimeout` option is set to 30s if tests are running in a CI environment and to 15s otherwise.
 * - `maxWorkers` option is set to 1 worker in the CI environment to allow concurrency without overwhelming the runner's cores.
 */
export const sharedTestConfig = {
    testTimeout: getE2ETestTimeout(),
    maxWorkers: isTestRunningInCIEnv() ? 1 : undefined,
};

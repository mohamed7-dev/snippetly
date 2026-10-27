import { AppConfig } from '@snippetly/server';
import { ApiClient } from './api-client';
import { TestServer } from './test-server';

export interface TestEnvironment {
    /**
     * @description
     * A Snippetly server instance.
     */
    server: TestServer;
    /**
     * @description
     * An API client configured for the Admin API.
     */
    adminClient: ApiClient;
    /**
     * @description
     * An API client configured for the Developer API.
     */
    developerClient: ApiClient;
}

export function createTestEnvironment(appConfig: Required<AppConfig>): TestEnvironment {
    const server = new TestServer(appConfig);
    const { port, admin, developer } = appConfig.api;
    const adminClient = new ApiClient(appConfig, `http://localhost:${port}/api/v1/${admin?.path!}`);
    const developerClient = new ApiClient(appConfig, `http://localhost:${port}/api/v1/${developer?.path!}`);
    return {
        server,
        adminClient,
        developerClient,
    };
}

import { ApiClient, type ApiClientConfig } from './api-client';
import { TestServer, type TestServerAdapter } from './test-server';

export interface TestEnvironmentConfig extends ApiClientConfig {
    api: {
        port?: number;
        admin?: { path?: string };
        developer?: { path?: string };
    };
}

export interface TestEnvironment<Config, App, State, Options> {
    server: TestServer<Config, App, State, Options>;
    adminClient: ApiClient;
    developerClient: ApiClient;
}

export function createTestEnvironment<Config extends TestEnvironmentConfig, App, State, Options>(
    config: Config,
    adapter: TestServerAdapter<Config, App, State, Options>,
): TestEnvironment<Config, App, State, Options> {
    const server = new TestServer(config, adapter);
    const { port, admin, developer } = config.api;
    const adminClient = new ApiClient(config, `http://localhost:${port}/api/v1/${admin?.path ?? ''}`);
    const developerClient = new ApiClient(config, `http://localhost:${port}/api/v1/${developer?.path ?? ''}`);

    return { server, adminClient, developerClient };
}

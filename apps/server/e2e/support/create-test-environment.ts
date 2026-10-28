import { AppConfig } from '@snippetly/server';
import { createTestEnvironment as createGenericTestEnvironment } from '@snippetly/testing';
import { serverTestAdapter } from './server-test-adapter';

export const createTestEnvironment = (appConfig: Required<AppConfig>) =>
    createGenericTestEnvironment(appConfig, serverTestAdapter);

import { App } from '@snippetly/server';
import { POPULATE_CONTEXT_NAME } from './populate';

export async function populateInitialData(app: App, initialData: import('@snippetly/server').InitialData) {
    const { Populator, Logger } = await import('@snippetly/server');
    const populator = app.getProvider<import('@snippetly/server').Populator>(Populator);
    try {
        await populator.populateInitialData(initialData);
        Logger.info('Populated initial data', POPULATE_CONTEXT_NAME);
    } catch (err: any) {
        Logger.error(err.message, POPULATE_CONTEXT_NAME);
    }
}

import { App, type Collection } from '@snippetly/server';

export async function populateCollections(
    app: App,
    initialData: import('@snippetly/server').InitialData,
): Promise<Collection[]> {
    const { Populator } = await import('@snippetly/server');
    const populator = app.getProvider<import('@snippetly/server').Populator>(Populator);
    return await populator.populateCollections(initialData);
}

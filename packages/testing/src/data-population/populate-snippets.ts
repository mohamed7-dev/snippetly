import { App, type Snippet } from '@snippetly/server';

export async function populateSnippets(
    app: App,
    initialData: import('@snippetly/server').InitialData,
): Promise<Snippet[]> {
    const { Populator } = await import('@snippetly/server');
    const populator = app.getProvider<import('@snippetly/server').Populator>(Populator);
    return await populator.populateSnippets(initialData);
}

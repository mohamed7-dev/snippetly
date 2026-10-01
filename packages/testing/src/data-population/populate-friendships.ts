import { App, InvalidFriendshipActionError, type Friendship } from '@snippetly/server';

export async function populateFriendships(
    app: App,
    initialData: import('@snippetly/server').InitialData,
): Promise<Array<Friendship | InvalidFriendshipActionError>> {
    const { Populator } = await import('@snippetly/server');
    const populator = app.getProvider<import('@snippetly/server').Populator>(Populator);
    return await populator.populateFriendships(initialData);
}

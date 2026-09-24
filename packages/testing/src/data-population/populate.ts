import { App, AppConfig, type Collection, type Developer } from '@snippetly/server';
import { TestServerOptions, TestServerState } from '../types';
import { populateCollections } from './populate-collections';
import { populateDevelopers } from './populate-developers';
import { populateInitialData } from './populate-initial-data';
import { populateSnippets } from './populate-snippets';

export const POPULATE_CONTEXT_NAME = 'Populate';

function resolveCreatorUserId(
    rawValue: string | undefined,
    developers: Developer[],
    entityName: string,
): string {
    const value = rawValue?.trim();

    if (value) {
        const match = developers.find(
            developer =>
                developer.user?.id === value ||
                developer.user?.identifier === value ||
                developer.id === value,
        );

        if (!match?.user?.id) {
            throw new Error(
                `Cannot assign ${entityName} creator: no developer user matches creatorUserId "${value}".`,
            );
        }

        return match.user.id;
    }

    if (!developers.length) {
        throw new Error(`Cannot assign ${entityName} creator because no developers were created.`);
    }

    const randomDeveloper = developers[Math.floor(Math.random() * developers.length)];
    if (!randomDeveloper.user?.id) {
        throw new Error(`Cannot assign ${entityName} creator because a created developer has no user id.`);
    }

    return randomDeveloper.user.id;
}

function resolveCollectionId(
    rawValue: string | undefined,
    collections: Collection[],
    snippetName: string,
): string {
    const value = rawValue?.trim();

    if (value) {
        const match = collections.find(
            collection => collection.id === value || collection.slug === value || collection.name === value,
        );

        if (!match?.id) {
            throw new Error(
                `Cannot assign snippet "${snippetName}" to a collection: no collection matches "${value}".`,
            );
        }

        return match.id;
    }

    if (!collections.length) {
        throw new Error(`Cannot assign snippet "${snippetName}" to a collection because none were created.`);
    }

    return collections[Math.floor(Math.random() * collections.length)].id;
}

export async function populate<T extends App>(
    config: Required<AppConfig>,
    bootstrapFn: (config: AppConfig) => Promise<T>,
    options: TestServerOptions,
): Promise<T> {
    (config.database as any).logging = false;
    const logging = options.logging === undefined ? true : options.logging;
    const originalRequireVerification = config.auth.requireVerification;
    config.auth.requireVerification = false;

    const app = await bootstrapFn(config);
    const logFn = (message: string) => (logging ? console.log(message) : null);

    await populateInitialData(app, options.initialData);

    const developers = await populateDevelopers(app, options.developerCount ?? 10, logFn);
    if (developers?.length) {
        const resolvedInitialData = {
            ...options.initialData,
            collections: (options.initialData.collections ?? []).map(collection => ({
                ...collection,
                creatorUserId: resolveCreatorUserId(
                    collection.creatorUserId,
                    developers,
                    `collection "${collection.name}"`,
                ),
            })),
            snippets: (options.initialData.snippets ?? []).map(snippet => ({
                ...snippet,
                creatorUserId: resolveCreatorUserId(
                    snippet.creatorUserId,
                    developers,
                    `snippet "${snippet.name}"`,
                ),
            })),
        };
        const collections = await populateCollections(app, resolvedInitialData);
        const snippets = await populateSnippets(app, {
            ...resolvedInitialData,
            snippets: resolvedInitialData.snippets.map(snippet => ({
                ...snippet,
                collectionId: resolveCollectionId(snippet.collectionId, collections, snippet.name),
            })),
        });

        const state: TestServerState = { developers, collections, snippets };
        (app as any).state = state;
    }

    config.auth.requireVerification = originalRequireVerification;
    return app;
}

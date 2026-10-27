import { FriendshipStatus } from '@snippetly/common/dto';
import { notNullOrUndefined } from '@snippetly/common/lib';
import { App, AppConfig, InitialData, isApiError, type Collection, type Developer } from '@snippetly/server';
import { TestServerOptions, TestServerState } from '../types';
import { createRandomFriendships } from './create-random-friendships';
import { populateCollections } from './populate-collections';
import { populateDevelopers } from './populate-developers';
import { populateFriendships } from './populate-friendships';
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

/**
 * Ensures every developer owns at least one collection.
 *
 * Existing collections are preserved. A collection is generated only for
 * developers who do not already have one.
 */
function ensureDeveloperCollections(developers: Developer[], collections: InitialData['collections']) {
    const result = [...collections];

    const developersWithCollections = new Set(
        result.map(collection => collection.creatorUserId).filter((id): id is string => Boolean(id)),
    );

    for (const developer of developers) {
        const userId = developer.user?.id;

        if (!userId) {
            throw new Error(
                `Cannot create collection for developer "${developer.id}" because the developer has no user id.`,
            );
        }

        if (developersWithCollections.has(userId)) {
            continue;
        }

        result.push({
            name: `Collection for ${developer.user?.identifier ?? developer.id}`,
            description: `Generated test collection for developer ${developer.user?.identifier ?? developer.id}.`,
            creatorUserId: userId,
        });

        developersWithCollections.add(userId);
    }

    return result;
}

/**
 * Ensures every developer owns at least one snippet.
 *
 * Existing snippets are preserved. A snippet is generated only for
 * developers who do not already have one.
 *
 * The generated snippet is assigned to one of that developer's collections.
 */
function ensureDeveloperSnippets(
    developers: Developer[],
    snippets: TestServerOptions['initialData']['snippets'],
    collections: InitialData['collections'],
) {
    const result = [...snippets];

    const developersWithSnippets = new Set(
        result.map(snippet => snippet.creatorUserId).filter((id): id is string => Boolean(id)),
    );

    for (const developer of developers) {
        const userId = developer.user?.id;

        if (!userId) {
            throw new Error(
                `Cannot create snippet for developer "${developer.id}" because the developer has no user id.`,
            );
        }

        if (developersWithSnippets.has(userId)) {
            continue;
        }

        const developerCollection = collections.find(collection => collection.creatorUserId === userId);

        if (!developerCollection) {
            throw new Error(
                `Cannot create snippet for developer "${developer.id}" because no collection was created for them.`,
            );
        }

        result.push({
            name: `Snippet for ${developer.user?.identifier ?? developer.id}`,
            description: `Generated test snippet for developer ${developer.user?.identifier ?? developer.id}.`,
            creatorUserId: userId,
        });

        developersWithSnippets.add(userId);
    }

    return result;
}

async function ensureDevelopersFriendship(
    app: App,
    developers: Developer[],
    initialData: InitialData,
    logFn: (message: string) => void,
) {
    if (developers.length < 2) return [];

    // N × (N - 1) / 2
    const maxFriendships = (developers.length * (developers.length - 1)) / 2;

    const friendships = createRandomFriendships(developers, maxFriendships);

    const result = await populateFriendships(app, {
        ...initialData,
        friendships: friendships.map(f => ({ ...f, status: FriendshipStatus.Accepted })),
    });

    const validFriendships = result
        .map(f => {
            if (isApiError(f)) {
                logFn(`${f.message}`);
                return;
            }
            return f;
        })
        .filter(notNullOrUndefined);

    return validFriendships;
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
        const resolvedFriendships = await ensureDevelopersFriendship(
            app,
            developers,
            {
                ...options.initialData,
                snippets: [],
                collections: [],
                friendships: [],
            },
            logFn,
        );

        /*
         * First resolve all explicitly configured creators.
         *
         * At this point we don't yet enforce the "one collection/snippet
         * per developer" invariant. We do that immediately afterwards.
         */
        const initialCollections = (options.initialData.collections ?? []).map(collection => ({
            ...collection,
            creatorUserId: resolveCreatorUserId(
                collection.creatorUserId,
                developers,
                `collection "${collection.name}"`,
            ),
        }));

        const initialSnippets = (options.initialData.snippets ?? []).map(snippet => ({
            ...snippet,
            creatorUserId: resolveCreatorUserId(
                snippet.creatorUserId,
                developers,
                `snippet "${snippet.name}"`,
            ),
        }));

        /*
         * Guarantee:
         *
         *   every developer -> >= 1 collection
         */
        const resolvedCollections = ensureDeveloperCollections(developers, initialCollections);

        /*
         * Guarantee:
         *
         *   every developer -> >= 1 snippet
         *
         * The generated snippet is put into a collection owned by the
         * same developer.
         */
        const resolvedSnippets = ensureDeveloperSnippets(developers, initialSnippets, resolvedCollections);

        const resolvedInitialData = {
            ...options.initialData,
            collections: resolvedCollections,
            snippets: resolvedSnippets,
            friendships: resolvedFriendships.map(f => ({
                requesterId: f.requester.id,
                addresseeId: f.addressee.id,
                status: f.status,
            })),
        };

        /*
         * Collections must be persisted first because snippets reference
         * collection IDs.
         */
        const collections = await populateCollections(app, resolvedInitialData as any);

        /*
         * Resolve collection references after the real collection IDs
         * exist in the database.
         */
        const snippets = await populateSnippets(app, {
            ...resolvedInitialData,
            snippets: resolvedSnippets.map(snippet => ({
                ...snippet,
                collectionId: resolveCollectionId(snippet.collectionId, collections, snippet.name),
            })) as any,
        });

        const state: TestServerState = {
            developers,
            collections,
            snippets,
            friendships: resolvedFriendships,
        };

        (app as any).state = state;
    }

    config.auth.requireVerification = originalRequireVerification;

    return app;
}

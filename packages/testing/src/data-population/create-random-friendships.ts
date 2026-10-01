import { Developer } from '@snippetly/server';

type Friendship = {
    requesterId: string;
    addresseeId: string;
};

export function createRandomFriendships(developers: Developer[], friendshipCount: number): Friendship[] {
    const developerCount = developers.length;

    // No developers => no friendships
    if (developerCount === 0) {
        return [];
    }

    // One developer cannot have a friendship with anyone.
    if (developerCount === 1) {
        if (friendshipCount > 0) {
            throw new Error('Cannot create friendships with only one developer.');
        }

        return [];
    }

    // Maximum number of unique undirected friendships:
    //
    //     N * (N - 1)
    //     -----------
    //          2
    //
    const maxFriendships = (developerCount * (developerCount - 1)) / 2;

    if (friendshipCount > maxFriendships) {
        throw new Error(
            `Cannot create ${friendshipCount} friendships ` +
                `for ${developerCount} developers. ` +
                `Maximum is ${maxFriendships}.`,
        );
    }

    // If every developer must have at least one friendship,
    // we need at least ceil(N / 2) relationships.
    const minimumFriendships = Math.ceil(developerCount / 2);

    if (friendshipCount < minimumFriendships) {
        throw new Error(
            `Cannot give every developer a friendship with only ` +
                `${friendshipCount} friendships. ` +
                `At least ${minimumFriendships} friendships are required ` +
                `for ${developerCount} developers.`,
        );
    }

    const friendships: Friendship[] = [];
    const used = new Set<string>();

    /**
     * Add a friendship while treating A-B and B-A
     * as the same relationship.
     */
    const addFriendship = (a: Developer, b: Developer) => {
        const key = [a.id, b.id].sort().join(':');

        if (used.has(key)) {
            return false;
        }

        used.add(key);

        friendships.push({
            requesterId: a.id,
            addresseeId: b.id,
        });

        return true;
    };

    /**
     * Phase 1:
     * Guarantee that every developer has at least one friendship.
     *
     * Shuffle developers and pair them sequentially.
     *
     * Example:
     *
     * A B C D E
     *
     * becomes:
     *
     * A-B
     * C-D
     *
     * E is left over, so we connect E to a random
     * already-connected developer.
     */
    const shuffled = [...developers];

    shuffle(shuffled);

    for (let i = 0; i + 1 < shuffled.length; i += 2) {
        addFriendship(shuffled[i], shuffled[i + 1]);
    }

    // Odd number of developers:
    // the final developer hasn't been connected yet.
    if (shuffled.length % 2 !== 0) {
        const last = shuffled[shuffled.length - 1];

        // Pick any other developer.
        const other = shuffled[Math.floor(Math.random() * (shuffled.length - 1))];

        addFriendship(last, other);
    }

    /**
     * Phase 2:
     * Add random relationships until we reach friendshipCount.
     */
    while (friendships.length < friendshipCount) {
        const a = developers[Math.floor(Math.random() * developers.length)];

        const b = developers[Math.floor(Math.random() * developers.length)];

        if (a.id === b.id) {
            continue;
        }

        addFriendship(a, b);
    }

    return friendships;
}

function shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }
}

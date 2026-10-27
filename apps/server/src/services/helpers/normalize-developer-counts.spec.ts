import { describe, expect, it } from 'vitest';
import { normalizeDeveloperCounts } from './normalize-developer-counts';

describe('normalizeDeveloperCounts', () => {
    it('returns numeric counts for every requested developer and defaults missing counts to zero', () => {
        expect(
            normalizeDeveloperCounts(['developer-1', 'developer-2', 'developer-3'], [
                { developerId: 'developer-1', count: '4' },
                { developerId: 'developer-3', count: 2 },
            ]),
        ).toEqual([
            { developerId: 'developer-1', count: 4 },
            { developerId: 'developer-2', count: 0 },
            { developerId: 'developer-3', count: 2 },
        ]);
    });

    it('returns an empty array when no developer IDs were requested', () => {
        expect(normalizeDeveloperCounts([], [])).toEqual([]);
    });
});

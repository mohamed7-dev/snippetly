import { describe, expect, it } from 'vitest';
import { createSkipPagination } from './skip-pagination';

describe('createSkipPagination', () => {
    it('returns the requested initial skip', () => {
        expect(createSkipPagination(12).initialSkip).toBe(12);
    });

    it('defaults the initial skip to zero', () => {
        expect(createSkipPagination(undefined).initialSkip).toBe(0);
        expect(createSkipPagination('invalid').initialSkip).toBe(0);
    });

    it('returns the next offset while more items remain', () => {
        const { getNextPageParam } = createSkipPagination();

        expect(getNextPageParam({ items: [1, 2], itemsCount: 5 }, [], 0)).toBe(2);
    });

    it('stops when the page is empty or the total count is reached', () => {
        const { getNextPageParam } = createSkipPagination();

        expect(getNextPageParam({ items: [], itemsCount: 5 }, [], 0)).toBeUndefined();
        expect(getNextPageParam({ items: [1], itemsCount: 3 }, [], 2)).toBeUndefined();
    });
});

import { describe, expect, it } from 'vitest';
import { formatSearchInput, parseSearchInput } from './search-input';

describe('parseSearchInput', () => {
    it('treats input without tags as a term', () => {
        expect(parseSearchInput('  async snippets  ')).toEqual({ term: 'async snippets' });
    });

    it('parses multiple tags and any remaining text', () => {
        expect(parseSearchInput('hooks #React #typescript hooks')).toEqual({
            term: 'hooks hooks',
            tags: ['React', 'typescript'],
        });
    });

    it('deduplicates tags without regard to case', () => {
        expect(parseSearchInput('#react #React')).toEqual({ tags: ['React'] });
    });
});

describe('formatSearchInput', () => {
    it('formats a search query for the search box', () => {
        expect(formatSearchInput({ term: 'hooks', tags: ['react', 'typescript'] })).toBe(
            '#react #typescript hooks',
        );
    });
});

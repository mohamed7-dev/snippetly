export type ParsedSearchInput = {
    term?: string;
    tags?: string[];
};

const tagPattern = /#([^\s#]+)/g;

export function parseSearchInput(value: string): ParsedSearchInput {
    const tags = Array.from(value.matchAll(tagPattern), match => match[1]);

    if (!tags.length) {
        const term = value.trim();
        return term ? { term } : {};
    }

    const uniqueTags = [...new Map(tags.map(tag => [tag.toLocaleLowerCase(), tag])).values()];
    const term = value.replace(tagPattern, ' ').replace(/\s+/g, ' ').trim();

    return {
        ...(term ? { term } : {}),
        tags: uniqueTags,
    };
}

export function formatSearchInput(search: unknown): string {
    if (typeof search !== 'object' || search === null) return '';

    const term = 'term' in search && typeof search.term === 'string' ? search.term : '';
    const tags =
        'tags' in search && Array.isArray(search.tags)
            ? search.tags.filter((tag): tag is string => typeof tag === 'string')
        : [];

    return [...tags.map(tag => `#${tag}`), term].filter(Boolean).join(' ');
}

import { defaultParseSearch, defaultStringifySearch } from '@tanstack/react-router';

type Search = Record<string, unknown>;
type SearchContainer = Search | unknown[];

function isObject(value: unknown): value is Search {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeSegment(value: string): string {
    return value.replaceAll('~', '~0').replaceAll('.', '~1').replaceAll('[', '~2').replaceAll(']', '~3');
}

function unescapeSegment(value: string): string {
    return value.replaceAll('~3', ']').replaceAll('~2', '[').replaceAll('~1', '.').replaceAll('~0', '~');
}

function flattenValue(value: unknown, path: string, output: Search): void {
    if (isObject(value)) {
        const entries = Object.entries(value);
        if (entries.length === 0) {
            output[path] = value;
            return;
        }
        for (const [key, child] of entries) {
            flattenValue(child, `${path}.${escapeSegment(key)}`, output);
        }
        return;
    }

    if (Array.isArray(value) && value.length > 0 && value.every(isObject)) {
        value.forEach((child, index) => flattenValue(child, `${path}[${index}]`, output));
        return;
    }

    output[path] = value;
}

function pathSegments(path: string): Array<string | number> {
    const segments: Array<string | number> = [];
    const expression = /(?:^|\.)([^.[\]]+)|\[(\d+)\]/g;
    let match: RegExpExecArray | null;
    let end = 0;

    while ((match = expression.exec(path))) {
        if (match.index !== end) throw new Error(`Invalid search parameter path "${path}"`);
        segments.push(match[1] === undefined ? Number(match[2]) : unescapeSegment(match[1]));
        end = expression.lastIndex;
    }

    if (end !== path.length || segments.length === 0) {
        throw new Error(`Invalid search parameter path "${path}"`);
    }
    return segments;
}

function assignPath(target: SearchContainer, path: string, value: unknown): void {
    const segments = pathSegments(path);
    let current = target;

    segments.forEach((segment, index) => {
        const last = index === segments.length - 1;
        const key = segment;

        if (Array.isArray(current)) {
            if (typeof key !== 'number') throw new Error(`Invalid search parameter path "${path}"`);
            if (last) {
                current[key] = value;
                return;
            }

            const nextIsArray = typeof segments[index + 1] === 'number';
            const next = current[key];
            if (next === undefined) current[key] = nextIsArray ? [] : {};
            else if ((Array.isArray(next) !== nextIsArray) || (!isObject(next) && !Array.isArray(next))) {
                throw new Error(`Conflicting search parameter path "${path}"`);
            }
            current = current[key] as SearchContainer;
            return;
        }

        if (typeof key !== 'string') throw new Error(`Invalid search parameter path "${path}"`);
        if (last) {
            Object.defineProperty(current, key, { configurable: true, enumerable: true, writable: true, value });
            return;
        }

        const nextIsArray = typeof segments[index + 1] === 'number';
        const next = current[key];
        if (next === undefined) {
            Object.defineProperty(current, key, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: nextIsArray ? [] : {},
            });
        } else if ((Array.isArray(next) !== nextIsArray) || (!isObject(next) && !Array.isArray(next))) {
            throw new Error(`Conflicting search parameter path "${path}"`);
        }
        current = current[key] as SearchContainer;
    });
}

function expandLegacyRequestsPath(key: string): string {
    return key.replace(/^requests\.(incoming|sent)\./, '$1.');
}

export function stringifySearch(search: Search): string {
    const flattened: Search = {};
    for (const [key, value] of Object.entries(search)) {
        flattenValue(value, escapeSegment(key), flattened);
    }
    return defaultStringifySearch(flattened);
}

export function parseSearch(searchString: string): Search {
    const parsed = defaultParseSearch(searchString) as Search;
    const result: Search = {};

    for (const [key, value] of Object.entries(parsed)) {
        const path = expandLegacyRequestsPath(key);
        if (path === key && !/[.[\]]/.test(key)) {
            Object.defineProperty(result, key, { configurable: true, enumerable: true, writable: true, value });
            continue;
        }
        assignPath(result, path, value);
    }

    return result;
}

import { RequestHandler } from 'express';

function parseValue(value: unknown): unknown {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    const isJsonObject = trimmed.startsWith('{') && trimmed.endsWith('}');
    const isJsonArray = trimmed.startsWith('[') && trimmed.endsWith(']');

    if (!isJsonObject && !isJsonArray) return value;

    try {
        return JSON.parse(trimmed);
    } catch {
        return value;
    }
}

export const parseSearchParams: RequestHandler = (req, _res, next) => {
    Object.defineProperty(req, 'query', { configurable: true, writable: true, value: req.query });

    const parsedQuery: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value)) {
            parsedQuery[key] = value.map(parseValue);
        } else {
            parsedQuery[key] = parseValue(value);
        }
    }
    req.query = parsedQuery as any;
    next();
};

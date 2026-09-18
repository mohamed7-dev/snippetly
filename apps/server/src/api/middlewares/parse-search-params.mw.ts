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
    for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value)) {
            req.query[key] = value.map(parseValue) as never;
        } else {
            req.query[key] = parseValue(value) as never;
        }
    }

    next();
};

import { ApiClientError } from './api-client';

type ErrorRecord = Record<string, unknown>;

export type FormattedApiError = {
    title: string;
    description?: string;
};

export function formatApiError(error: unknown): FormattedApiError {
    const payload = getErrorPayload(error);
    const title = getMessage(payload) ?? getMessage(error) ?? 'An unexpected error occurred';
    const fieldErrors = getFieldErrors(payload?.fields);

    return {
        title,
        ...(fieldErrors.length ? { description: fieldErrors.join('; ') } : {}),
    };
}

function getErrorPayload(error: unknown): ErrorRecord | undefined {
    if (error instanceof ApiClientError) {
        return asRecord(error.payload);
    }

    const record = asRecord(error);
    if (!record) return undefined;

    const payload = asRecord(record.payload);
    if (payload) return payload;

    const response = asRecord(record.response);
    const responseData = response && asRecord(response.data);
    if (responseData) return responseData;

    return record;
}

function getMessage(value: unknown): string | undefined {
    if (typeof value === 'string' && value.trim()) return value;
    const record = asRecord(value);
    return typeof record?.message === 'string' && record.message.trim()
        ? record.message
        : undefined;
}

function getFieldErrors(value: unknown): string[] {
    const fields = asRecord(value);
    if (!fields) return [];

    return Object.entries(fields)
        .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && !!entry[1].trim())
        .map(([field, message]) => `${formatFieldName(field)}: ${message}`);
}

function formatFieldName(field: string): string {
    return field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[._-]+/g, ' / ')
        .toLowerCase()
        .replace(/^\w/, character => character.toUpperCase());
}

function asRecord(value: unknown): ErrorRecord | undefined {
    return typeof value === 'object' && value !== null ? (value as ErrorRecord) : undefined;
}
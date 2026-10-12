import type { SortDirection } from '@snippetly/common/dto';
import type { SortFieldDescriptor } from './types';
import { deepEqual, isPlainObject } from './utils';

let counter = 0;
const defaultId = () => `s${++counter}`;

/**
 * @description
 * One sort criterion. The array order is the priority (first = primary).
 */
export interface SortItem {
    /** Stable React key; never sent over the wire. */
    id: string;
    field: string;
    direction: SortDirection;
}

export type SortParseResult = { ok: true; items: SortItem[] } | { ok: false; reason: string };

/**
 * @description
 * Wire shape: `{ name: 'ASC', price: 'DESC' }`. Key order is the priority.
 */
export type SortQuery = Record<string, SortDirection>;

/**
 * @description
 * Order-aware equality. The generic deepEqual ignores key order, which is exactly
 * the thing that matters here: `{a, b}` and `{b, a}` are different sorts.
 */
export function sameSortQuery(a: SortQuery | null | undefined, b: SortQuery | null | undefined): boolean {
    return deepEqual(Object.entries(a ?? {}), Object.entries(b ?? {}));
}

/**
 * @description
 * Fields a row may use: everything not already taken by another row.
 */
export function availableSortFields(
    fields: SortFieldDescriptor[],
    items: SortItem[],
    selfId?: string,
): SortFieldDescriptor[] {
    const taken = new Set(items.filter(i => i.id !== selfId).map(i => i.field));
    return fields.filter(f => !taken.has(f.name));
}

/**
 * @description
 * Parses a wire sort object, preserving key order as priority. Refuses anything unknown.
 */
export function fromSortQuery(
    query: unknown,
    fieldsDescriptors: SortFieldDescriptor[],
    makeId: () => string = defaultId,
): SortParseResult {
    if (query === null || query === undefined) return { ok: true, items: [] };

    if (!isPlainObject(query)) return { ok: false, reason: 'sort must be an object' };

    const items: SortItem[] = [];

    for (const [field, direction] of Object.entries(query)) {
        if (direction === undefined) continue;
        const descriptor = fieldsDescriptors.find(f => f.name === field);
        if (!descriptor) return { ok: false, reason: `unknown sort field "${field}"` };
        if (typeof direction !== 'string' || !descriptor.directions.includes(direction as SortDirection)) {
            return { ok: false, reason: `invalid direction for "${field}"` };
        }
        items.push({ id: makeId(), field, direction: direction as SortDirection });
    }
    return { ok: true, items };
}

/**
 * @description
 * Rows with an unknown field or direction are skipped, and a repeated field keeps its first position.
 */
export function toSortQuery(items: SortItem[], fieldsDescriptors: SortFieldDescriptor[]): SortQuery {
    const out: SortQuery = {};
    for (const item of items) {
        const field = fieldsDescriptors.find(f => f.name === item.field);
        if (!field || !field.directions.includes(item.direction) || item.field in out) continue;
        out[item.field] = item.direction;
    }
    return out;
}

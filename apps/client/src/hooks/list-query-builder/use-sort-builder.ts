import { introspectSortSchema } from '@/lib/list-query-builder/introspect-sort-schema';
import {
    availableSortFields,
    fromSortQuery,
    sameSortQuery,
    toSortQuery,
    type SortItem,
    type SortQuery,
} from '@/lib/list-query-builder/sort-codec';
import type { IntrospectSortSchemaOptions, SortFieldDescriptor } from '@/lib/list-query-builder/types';
import type { SortDirection } from '@snippetly/common/dto';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type z from 'zod';

export interface SortRow {
    id: string;
    /** Position in the priority order, 0 = primary. */
    index: number;
    field: SortFieldDescriptor | null;
    direction: SortDirection;
    /** Fields this row can switch to: its own plus every unused one. */
    fields: SortFieldDescriptor[];
    directions: SortDirection[];
    canMoveUp: boolean;
    canMoveDown: boolean;
}

export interface UseSortBuilderOptions extends IntrospectSortSchemaOptions {
    /** Controlled sort. Re-parsed only when it differs (order included) from the last query the hook knows. */
    value?: SortQuery;
    /** Initial sort for uncontrolled use. */
    defaultValue?: SortQuery;
    /** Called with the canonical sort object whenever it changes, including reorders. */
    onChange?: (query: SortQuery) => void;
}

export function useSortBuilder(
    source: z.ZodType | SortFieldDescriptor[],
    options: UseSortBuilderOptions = {},
) {
    const { value, defaultValue, onChange, labels } = options;
    const labelsKey = labels ? JSON.stringify(labels) : '';
    const fields = useMemo(
        () => (Array.isArray(source) ? source : introspectSortSchema(source, { labels })),
        [source, labelsKey],
    );

    const idCounter = useRef(0);
    const makeId = useCallback(() => `s${++idCounter.current}`, []);

    const [initial] = useState(() => {
        const seed = value ?? defaultValue;
        const parsed = seed === undefined ? null : fromSortQuery(seed, fields, makeId);
        return {
            items: parsed?.ok ? parsed.items : ([] as SortItem[]),
            unsupported: parsed && !parsed.ok ? parsed.reason : null,
            query: (seed ?? {}) as SortQuery,
        };
    });

    const [items, setItems] = useState<SortItem[]>(initial.items);
    const [unsupported, setUnsupported] = useState<string | null>(initial.unsupported);

    const itemsRef = useRef(items);
    const unsupportedRef = useRef(unsupported);
    const lastQuery = useRef<SortQuery>(initial.query);
    const fieldsRef = useRef(fields);
    const onChangeRef = useRef(onChange);
    fieldsRef.current = fields;
    onChangeRef.current = onChange;

    const commit = useCallback((next: SortItem[]) => {
        itemsRef.current = next;
        setItems(next);
        const query = toSortQuery(next, fieldsRef.current);
        if (!sameSortQuery(query, lastQuery.current)) {
            lastQuery.current = query;
            onChangeRef.current?.(query);
        }
    }, []);

    const update = useCallback(
        (fn: (items: SortItem[]) => SortItem[]) => {
            if (unsupportedRef.current) return;
            commit(fn(itemsRef.current));
        },
        [commit],
    );

    // Sync an external `value` in when it differs, order included, from what we last emitted or accepted.
    const seenFields = useRef(fields);
    useEffect(() => {
        const fieldsChanged = seenFields.current !== fields;
        seenFields.current = fields;
        if (value === undefined) return;
        if (!fieldsChanged && sameSortQuery(value, lastQuery.current)) return;

        lastQuery.current = value;
        const parsed = fromSortQuery(value, fields, makeId);
        const next = parsed.ok ? parsed.items : [];
        const reason = parsed.ok ? null : parsed.reason;
        itemsRef.current = next;
        unsupportedRef.current = reason;
        setItems(next);
        setUnsupported(reason);
    }, [value, fields, makeId]);

    /* ------------------------------- actions -------------------------------- */

    const add = useCallback(
        (fieldName?: string) =>
            update(list => {
                const free = availableSortFields(fieldsRef.current, list, '');
                const field = fieldName ? free.find(f => f.name === fieldName) : free[0];
                if (!field) return list;
                return [...list, { id: makeId(), field: field.name, direction: field.directions[0] }];
            }),
        [update, makeId],
    );

    const remove = useCallback((id: string) => update(list => list.filter(i => i.id !== id)), [update]);

    /** Switch a row's field. Ignored if another row already sorts by it. */
    const setField = useCallback(
        (id: string, fieldName: string) =>
            update(list =>
                list.map(item => {
                    if (item.id !== id || item.field === fieldName) return item;
                    const field = availableSortFields(fieldsRef.current, list, id).find(
                        f => f.name === fieldName,
                    );
                    if (!field) return item;
                    const direction = field.directions.includes(item.direction)
                        ? item.direction
                        : field.directions[0];
                    return { ...item, field: fieldName, direction };
                }),
            ),
        [update],
    );

    const setDirection = useCallback(
        (id: string, direction: SortDirection) =>
            update(list =>
                list.map(item => {
                    if (item.id !== id) return item;
                    const field = fieldsRef.current.find(f => f.name === item.field);
                    return field?.directions.includes(direction) ? { ...item, direction } : item;
                }),
            ),
        [update],
    );

    /** Move a row to a new position in the priority order (clamped). */
    const move = useCallback(
        (id: string, toIndex: number) =>
            update(list => {
                const from = list.findIndex(i => i.id === id);
                if (from === -1) return list;
                const to = Math.max(0, Math.min(list.length - 1, toIndex));
                if (to === from) return list;
                const next = [...list];
                const [item] = next.splice(from, 1);
                next.splice(to, 0, item);
                return next;
            }),
        [update],
    );

    const clear = useCallback(() => update(() => []), [update]);

    /** Clears everything, including an unsupported incoming value. */
    const reset = useCallback(() => {
        unsupportedRef.current = null;
        setUnsupported(null);
        commit([]);
    }, [commit]);

    /* ------------------------------ view model ------------------------------ */

    const rows = useMemo<SortRow[]>(
        () =>
            items.map((item, index) => {
                const field = fields.find(f => f.name === item.field) ?? null;
                return {
                    id: item.id,
                    index,
                    field,
                    direction: item.direction,
                    fields: availableSortFields(fields, items, item.id),
                    directions: field?.directions ?? [],
                    canMoveUp: index > 0,
                    canMoveDown: index < items.length - 1,
                };
            }),
        [items, fields],
    );

    const query = useMemo(() => toSortQuery(items, fields), [items, fields]);
    const canAdd = useMemo(() => availableSortFields(fields, items, '').length > 0, [fields, items]);

    return {
        fields,
        rows,
        /** Canonical sort object. Key order is the priority. */
        query,
        canAdd,
        /** Set when the incoming `value` can't be shown. Edits are ignored until reset(). */
        unsupported,
        add,
        remove,
        setField,
        setDirection,
        move,
        clear,
        reset,
    };
}
export type SortBuilder = ReturnType<typeof useSortBuilder>;

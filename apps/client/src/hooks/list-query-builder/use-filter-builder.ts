import {
    ROOT_ID,
    collectConditions,
    conditionStatus,
    emptyState,
    findParent,
    fromQuery,
    groupsEnabled,
    isCondition,
    normalizeInput,
    sameInput,
    toQuery,
    updateNode,
    type Combinator,
    type ConditionNode,
    type FilterInput,
    type FilterNode,
    type FilterQuery,
    type FilterState,
    type GroupNode,
} from '@/lib/list-query-builder/filter-codec';
import { introspectFilterSchema } from '@/lib/list-query-builder/introspect-filter-schema';
import {
    type FilterDescriptor,
    type FilterFieldDescriptor,
    type FilterOperatorDescriptor,
    type IntrospectFilterSchemaOptions,
} from '@/lib/list-query-builder/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  Public types                                                              */
/* -------------------------------------------------------------------------- */

export type FilterBuilderInput = FilterInput & { filter: FilterQuery };

export interface UseFilterBuilderOptions extends IntrospectFilterSchemaOptions {
    /** Controlled `{ filter, filterOperator }`. Re-parsed only when it differs from the last value the hook knows. */
    value?: FilterInput;
    /** Initial value for uncontrolled use. */
    defaultValue?: FilterInput;
    /** Called with the canonical input, only when it actually changes. */
    onChange?: (input: FilterBuilderInput) => void;
}

/** View model for one condition row. */
export interface FilterRow {
    id: string;
    field: FilterFieldDescriptor | null;
    operator: FilterOperatorDescriptor | null;
    /** Fields this row can switch to. */
    fields: FilterFieldDescriptor[];
    /** Operators selectable for the row's current field. */
    operators: FilterOperatorDescriptor[];
    value: unknown;
    complete: boolean;
    /** Message when a value is present but invalid. Null for empty or partial input. */
    error: string | null;
}

export type ChildView = { type: 'row'; row: FilterRow } | { type: 'group'; group: GroupView };

/** View model for a group. The root is the group with `isRoot`. */
export interface GroupView {
    id: string;
    isRoot: boolean;
    combinator: Combinator;
    children: ChildView[];
    canAddCondition: boolean;
    canAddGroup: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Constraints for schemas that lack _and / _or                              */
/* -------------------------------------------------------------------------- */

/** Prefer an operator that needs input, so adding a row doesn't instantly emit e.g. `notNull: true`. */
const pickDefaultOperator = (ops: FilterOperatorDescriptor[]) =>
    ops.find(o => o.valueKind !== 'none') ?? ops[0] ?? null;

/** Lists start as [], everything else as undefined. */
const defaultValueFor = (op: FilterOperatorDescriptor | null | undefined): unknown =>
    op?.valueKind === 'list' ? [] : undefined;

const sameRange = (a: FilterOperatorDescriptor, b: FilterOperatorDescriptor) =>
    JSON.stringify(a.rangeKeys) === JSON.stringify(b.rangeKeys);

/**
 * Root conditions become top-level fields. Without an `_and` key a repeated field+operator can't be
 * written ('pairs'), and with root Or but no `_or` key a field can appear only once ('fields').
 * Conditions inside nested groups are array items and are never constrained.
 */
function rootConstraint(d: FilterDescriptor, combinator: Combinator): 'none' | 'pairs' | 'fields' {
    if (combinator === 'and' && !d.groups.and) return 'pairs';
    if (combinator === 'or' && !d.groups.or) return 'fields';
    return 'none';
}

function violatesConstraint(d: FilterDescriptor, root: GroupNode): boolean {
    const constraint = rootConstraint(d, root.combinator);
    if (constraint === 'none') return false;
    const conditions = root.children.filter(isCondition);
    const keys = conditions.map(c => (constraint === 'pairs' ? `${c.field}\u0000${c.operator}` : c.field));
    return new Set(keys).size < keys.length;
}

interface FieldChoice {
    field: FilterFieldDescriptor;
    operators: FilterOperatorDescriptor[];
}

/** Fields (with usable operators) that a condition in `parentId` may pick, ignoring `selfId`. */
function fieldChoices(d: FilterDescriptor, root: GroupNode, parentId: string, selfId: string): FieldChoice[] {
    const constraint = parentId === ROOT_ID ? rootConstraint(d, root.combinator) : 'none';
    const siblings =
        parentId === ROOT_ID ? root.children.filter(isCondition).filter(c => c.id !== selfId) : [];

    return d.fields
        .map(field => {
            let operators = field.operators;
            if (constraint === 'pairs') {
                const taken = new Set(siblings.filter(c => c.field === field.name).map(c => c.operator));
                operators = operators.filter(o => !taken.has(o.key));
            } else if (constraint === 'fields' && siblings.some(c => c.field === field.name)) {
                operators = [];
            }
            return { field, operators };
        })
        .filter(choice => choice.operators.length > 0);
}

const isDescriptor = (x: unknown): x is FilterDescriptor =>
    typeof x === 'object' && x !== null && 'fields' in x && 'groups' in x && 'keys' in x;

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

export function useFilterBuilder(
    source: z.ZodType | FilterDescriptor,
    options: UseFilterBuilderOptions = {},
) {
    const { value, defaultValue, onChange, labels, andKey, orKey, flagOperators } = options;

    // Keyed by content so inline `labels={{...}}` / `flagOperators={[...]}` don't re-introspect every render.
    const labelsKey = labels ? JSON.stringify(labels) : '';
    const flagsKey = flagOperators ? flagOperators.join('\u0000') : '';
    const descriptor = useMemo(
        () =>
            isDescriptor(source)
                ? source
                : introspectFilterSchema(source, { labels, andKey, orKey, flagOperators }),
        [source, labelsKey, andKey, orKey, flagsKey],
    );

    const idCounter = useRef(0);
    const makeId = useCallback(() => `n${++idCounter.current}`, []);

    // Seed state once from value/defaultValue.
    const [initial] = useState(() => {
        const seed = value ?? defaultValue;
        const parsed = seed === undefined ? null : fromQuery(seed, descriptor, makeId);
        return {
            state: parsed?.ok ? parsed.state : emptyState(),
            unsupported: parsed && !parsed.ok ? parsed.reason : null,
            input: normalizeInput(seed),
        };
    });

    const [state, setState] = useState<FilterState>(initial.state);
    const [unsupported, setUnsupported] = useState<string | null>(initial.unsupported);

    // Refs are the source of truth inside actions so several calls in one tick compose correctly.
    const stateRef = useRef(state);
    const unsupportedRef = useRef(unsupported);
    const lastInput = useRef<FilterInput>(initial.input);
    const descriptorRef = useRef(descriptor);
    const onChangeRef = useRef(onChange);
    descriptorRef.current = descriptor;
    onChangeRef.current = onChange;

    const commit = useCallback((next: FilterState) => {
        stateRef.current = next;
        setState(next);
        const input = toQuery(next, descriptorRef.current);
        // Drafts and no-op edits produce the same input, so they never reach onChange.
        if (!sameInput(input, lastInput.current)) {
            lastInput.current = input;
            onChangeRef.current?.(input);
        }
    }, []);

    /** Apply an edit, unless the incoming value was unsupported (then only reset() works). */
    const update = useCallback(
        (fn: (s: FilterState) => FilterState) => {
            if (unsupportedRef.current) return;
            commit(fn(stateRef.current));
        },
        [commit],
    );

    // Sync an external `value` in, but only when it differs from what we last emitted or accepted.
    const seenDescriptor = useRef(descriptor);
    useEffect(() => {
        const descriptorChanged = seenDescriptor.current !== descriptor;
        seenDescriptor.current = descriptor;
        if (value === undefined) return;
        if (!descriptorChanged && sameInput(value, lastInput.current)) return;

        lastInput.current = normalizeInput(value);
        const parsed = fromQuery(value, descriptor, makeId);
        const next = parsed.ok ? parsed.state : emptyState();
        const reason = parsed.ok ? null : parsed.reason;
        stateRef.current = next;
        unsupportedRef.current = reason;
        setState(next);
        setUnsupported(reason);
    }, [value, descriptor, makeId]);

    /* ------------------------------- actions -------------------------------- */

    /** Add a condition to a group (the root by default). */
    const addCondition = useCallback(
        (groupId: string = ROOT_ID, fieldName?: string) =>
            update(s => {
                const id = makeId();
                const choices = fieldChoices(descriptorRef.current, s.root, groupId, id);
                const choice = fieldName ? choices.find(c => c.field.name === fieldName) : choices[0];
                const op = choice && pickDefaultOperator(choice.operators);
                if (!choice || !op) return s;
                const node: ConditionNode = {
                    kind: 'condition',
                    id,
                    field: choice.field.name,
                    operator: op.key,
                    value: defaultValueFor(op),
                };
                return {
                    root: updateNode(s.root, groupId, n =>
                        n.kind === 'group' ? { ...n, children: [...n.children, node] } : n,
                    ),
                };
            }),
        [update, makeId],
    );

    /** Add an empty group to a group. Needs both `_and` and `_or` in the schema. */
    const addGroup = useCallback(
        (parentId: string = ROOT_ID, combinator: Combinator = 'and') =>
            update(s => {
                if (!groupsEnabled(descriptorRef.current)) return s;
                const node: GroupNode = { kind: 'group', id: makeId(), combinator, children: [] };
                return {
                    root: updateNode(s.root, parentId, n =>
                        n.kind === 'group' ? { ...n, children: [...n.children, node] } : n,
                    ),
                };
            }),
        [update, makeId],
    );

    /** Remove a condition or a whole group (and everything in it). The root can't be removed. */
    const remove = useCallback(
        (id: string) => {
            if (id === ROOT_ID) return;
            update(s => ({ root: updateNode(s.root, id, () => null) }));
        },
        [update],
    );

    const setField = useCallback(
        (id: string, fieldName: string) =>
            update(s => {
                const parent = findParent(s.root, id);
                const target = parent?.children.find(c => c.id === id);
                if (!parent || !target || target.kind !== 'condition' || target.field === fieldName) return s;
                const choice = fieldChoices(descriptorRef.current, s.root, parent.id, id).find(
                    c => c.field.name === fieldName,
                );
                if (!choice) return s;
                const op = pickDefaultOperator(choice.operators);
                return {
                    root: updateNode(s.root, id, n => ({
                        ...(n as ConditionNode),
                        field: fieldName,
                        operator: op?.key ?? null,
                        value: defaultValueFor(op),
                    })),
                };
            }),
        [update],
    );

    const setOperator = useCallback(
        (id: string, operatorKey: string) =>
            update(s => ({
                root: updateNode(s.root, id, n => {
                    if (n.kind !== 'condition') return n;
                    const field = descriptorRef.current.fields.find(f => f.name === n.field);
                    const prev = field?.operators.find(o => o.key === n.operator);
                    const next = field?.operators.find(o => o.key === operatorKey);
                    if (!next) return n;
                    // Keep the typed value when the new operator takes the same kind of input.
                    const keep =
                        !!prev &&
                        prev.valueKind === next.valueKind &&
                        next.valueKind !== 'none' &&
                        sameRange(prev, next);
                    return { ...n, operator: operatorKey, value: keep ? n.value : defaultValueFor(next) };
                }),
            })),
        [update],
    );

    const setValue = useCallback(
        (id: string, v: unknown) =>
            update(s => ({
                root: updateNode(s.root, id, n => (n.kind === 'condition' ? { ...n, value: v } : n)),
            })),
        [update],
    );

    /**
     * Set a group's combinator. For the root this is `filterOperator`. Ignored when the schema can't
     * write the result (see rootConstraint).
     */
    const setCombinator = useCallback(
        (groupId: string, combinator: Combinator) =>
            update(s => {
                const root = updateNode(s.root, groupId, n =>
                    n.kind === 'group' ? { ...n, combinator } : n,
                );
                return groupId === ROOT_ID && violatesConstraint(descriptorRef.current, root) ? s : { root };
            }),
        [update],
    );

    /** Remove everything, keeping the root combinator. */
    const clear = useCallback(() => update(s => ({ root: { ...s.root, children: [] } })), [update]);

    /** Clears everything, including an unsupported incoming value. */
    const reset = useCallback(() => {
        unsupportedRef.current = null;
        setUnsupported(null);
        commit(emptyState(stateRef.current.root.combinator));
    }, [commit]);

    /* ------------------------------ view model ------------------------------ */

    const { tree, rows } = useMemo(() => {
        const flat: FilterRow[] = [];

        const buildGroup = (group: GroupNode, isRoot: boolean): GroupView => {
            const children = group.children.map((child: FilterNode): ChildView => {
                if (child.kind === 'group') return { type: 'group', group: buildGroup(child, false) };

                const choices = fieldChoices(descriptor, state.root, group.id, child.id);
                const field = descriptor.fields.find(f => f.name === child.field) ?? null;
                const { complete, error } = conditionStatus(child, descriptor);
                const row: FilterRow = {
                    id: child.id,
                    field,
                    operator: field?.operators.find(o => o.key === child.operator) ?? null,
                    fields: choices.map(c => c.field),
                    operators: choices.find(c => c.field.name === child.field)?.operators ?? [],
                    value: child.value,
                    complete,
                    error,
                };
                flat.push(row);
                return { type: 'row', row };
            });

            return {
                id: group.id,
                isRoot,
                combinator: group.combinator,
                children,
                canAddCondition: fieldChoices(descriptor, state.root, group.id, '').length > 0,
                canAddGroup: groupsEnabled(descriptor),
            };
        };

        return { tree: buildGroup(state.root, true), rows: flat };
    }, [state, descriptor]);

    const query = useMemo(() => toQuery(state, descriptor), [state, descriptor]);

    return {
        descriptor,
        /** The group tree to render. */
        tree,
        /** Every condition row, depth first. Handy for aggregates (errors, incomplete count). */
        rows,
        /** The root combinator, i.e. `filterOperator`. */
        combinator: state.root.combinator,
        isEmpty: state.root.children.length === 0,
        /** How many conditions the tree holds, complete or not. */
        conditionCount: collectConditions(state.root).length,
        /** Canonical `{ filter, filterOperator? }` for the complete, valid rows. */
        query,
        /** Set when the incoming `value` can't be shown. Edits are ignored until reset(). */
        unsupported,
        addCondition,
        addGroup,
        remove,
        setField,
        setOperator,
        setValue,
        setCombinator,
        clear,
        reset,
    };
}

export type FilterBuilder = ReturnType<typeof useFilterBuilder>;

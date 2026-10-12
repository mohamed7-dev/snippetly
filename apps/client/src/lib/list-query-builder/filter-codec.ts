import { FilterGroupOperator } from '@snippetly/common/dto';
import type { FilterDescriptor } from './types';

/* -------------------------------------------------------------------------- */
/*  Wire format and what this codec promises                                  */
/* -------------------------------------------------------------------------- */
/**
 * Listing endpoints take { filter: {...}, filterOperator?: 'AND' | 'OR' } (default 'AND').
 *
 *   filter          top-level fields, plus `_and: [...]` / `_or: [...]` whose items are filter
 *                   objects and may nest to any depth
 *   filterOperator  how the TOP-LEVEL FIELDS of `filter` combine
 *
 * The UI is a tree. The root group's combinator is `filterOperator`; every other group is an
 * `_and` / `_or` array. A group's children are conditions (`{ field: { operator: value } }`) and
 * further groups.
 *
 * What a service does when top-level fields sit next to `_and` / `_or` under `filterOperator: 'OR'`
 * is not visible from the shape (is the `_and` group one more operand of the OR, or ANDed on top?).
 * So this codec only emits shapes that mean the same thing under either reading, and refuses to
 * parse shapes that don't:
 *
 *   - every item inside `_and` / `_or` is a single condition or a single group key
 *   - root And: conditions are top-level fields, groups (and repeated field+operator pairs) go to `_and`
 *   - root Or:  conditions are top-level fields only when there are no groups and every field appears
 *               once with one operator; otherwise everything moves into `_or: [...]`
 */

/* -------------------------------------------------------------------------- */
/*  State model                                                               */
/* -------------------------------------------------------------------------- */

export type Combinator = 'and' | 'or';

export interface ConditionNode {
    kind: 'condition';
    /** Stable React key; never sent over the wire. */
    id: string;
    field: string;
    operator: string | null;
    /** Same shape as on the wire (list -> array, range -> object/tuple).
     *  Ignored for 'none' operators, which are emitted as `true`. */
    value: unknown;
}

export interface GroupNode {
    kind: 'group';
    id: string;
    combinator: Combinator;
    children: FilterNode[];
}

export type FilterNode = ConditionNode | GroupNode;

export interface FilterState {
    /** The root group. Its combinator is the `filterOperator`. */
    root: GroupNode;
}

export type FilterQuery = Record<string, unknown>;
export type FilterOperator = FilterGroupOperator;

/** The filter part of a listing input. */
export interface FilterInput {
    filter?: FilterQuery;
    filterOperator?: FilterGroupOperator;
}

export type ParseResult = { ok: true; state: FilterState } | { ok: false; reason: string };

export const ROOT_ID = 'root';

/* -------------------------------------------------------------------------- */
/*  Utilities                                                                 */
/* -------------------------------------------------------------------------- */

let counter = 0;
const defaultId = () => `n${++counter}`;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

const blank = (v: unknown) =>
    v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v));

export function deepEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(k => k in b && deepEqual((a as any)[k], (b as any)[k]));
}

/** Canonical form for comparing inputs: `filterOperator: 'AND'` is the default, so it is dropped. */
export function normalizeInput(input: FilterInput | null | undefined): FilterInput & { filter: FilterQuery } {
    const operator =
        typeof input?.filterOperator === 'string' ? input.filterOperator.toUpperCase() : undefined;

    return {
        filter: input?.filter ?? {},
        ...(operator === FilterGroupOperator.OR ? { filterOperator: FilterGroupOperator.OR } : {}),
    };
}

export const sameInput = (a: FilterInput | null | undefined, b: FilterInput | null | undefined) =>
    deepEqual(normalizeInput(a), normalizeInput(b));

/* -------------------------------------------------------------------------- */
/*  Tree helpers                                                              */
/* -------------------------------------------------------------------------- */

export function emptyState(combinator: Combinator = 'and'): FilterState {
    return { root: { kind: 'group', id: ROOT_ID, combinator, children: [] } };
}

export const isCondition = (n: FilterNode): n is ConditionNode => n.kind === 'condition';
export const isGroup = (n: FilterNode): n is GroupNode => n.kind === 'group';

/** Nested groups need both keys: an `_and` array can hold an `_or` group and vice versa. */
export const groupsEnabled = (d: FilterDescriptor) => d.groups.and && d.groups.or;

/** Every condition in the tree, depth first, in display order. */
export function collectConditions(group: GroupNode): ConditionNode[] {
    return group.children.flatMap(c => (c.kind === 'condition' ? [c] : collectConditions(c)));
}

export function findNode(group: GroupNode, id: string): FilterNode | null {
    if (group.id === id) return group;
    for (const child of group.children) {
        if (child.id === id) return child;
        if (child.kind === 'group') {
            const hit = findNode(child, id);
            if (hit) return hit;
        }
    }
    return null;
}

export function findParent(group: GroupNode, id: string): GroupNode | null {
    for (const child of group.children) {
        if (child.id === id) return group;
        if (child.kind === 'group') {
            const hit = findParent(child, id);
            if (hit) return hit;
        }
    }
    return null;
}

/**
 * Immutably replace (or, when fn returns null, remove) the node with `id`. Unchanged subtrees keep
 * their identity. The root can be replaced but not removed.
 */
export function updateNode(
    group: GroupNode,
    id: string,
    fn: (node: FilterNode) => FilterNode | null,
): GroupNode {
    if (group.id === id) {
        const next = fn(group);
        return next && next.kind === 'group' ? next : group;
    }
    let changed = false;
    const children: FilterNode[] = [];
    for (const child of group.children) {
        if (child.id === id) {
            changed = true;
            const next = fn(child);
            if (next) children.push(next);
        } else if (child.kind === 'group') {
            const next = updateNode(child, id, fn);
            if (next !== child) changed = true;
            children.push(next);
        } else {
            children.push(child);
        }
    }
    return changed ? { ...group, children } : group;
}

/* -------------------------------------------------------------------------- */
/*  Completeness                                                              */
/* -------------------------------------------------------------------------- */

export interface ConditionStatus {
    complete: boolean;
    /** Set only when a value is present but fails the operator's schema. Missing/partial input is
     *  "incomplete", not an error, so a fresh row never shows red. */
    error: string | null;
}

type ConditionLike = Pick<ConditionNode, 'field' | 'operator' | 'value'>;

function findOperator(d: FilterDescriptor, field: string, operator: string | null) {
    const f = d.fields.find(x => x.name === field);
    return f?.operators.find(o => o.key === operator);
}

export function conditionStatus(c: ConditionLike, d: FilterDescriptor): ConditionStatus {
    const incomplete: ConditionStatus = { complete: false, error: null };
    const op = findOperator(d, c.field, c.operator);
    if (!op) return incomplete;
    if (op.valueKind === 'none') return { complete: true, error: null };

    const v = c.value;
    if (blank(v)) return incomplete;

    if (op.valueKind === 'list') {
        if (!Array.isArray(v) || v.length === 0 || v.some(blank)) return incomplete;
    } else if (op.valueKind === 'range') {
        const bounds = op.rangeKeys
            ? op.rangeKeys.map((k: any) => (v as any)?.[k])
            : Array.isArray(v)
              ? v
              : [];
        if (bounds.length !== 2 || bounds.some(blank)) return incomplete;
    }

    const parsed = op.valueSchema.safeParse(v);
    if (parsed.success) return { complete: true, error: null };
    return { complete: false, error: parsed.error.issues[0]?.message ?? 'Invalid value' };
}

/** A condition is emitted only when field + operator are valid and the value parses. */
export function isComplete(c: ConditionLike, d: FilterDescriptor): boolean {
    return conditionStatus(c, d).complete;
}

/* -------------------------------------------------------------------------- */
/*  State -> query                                                            */
/* -------------------------------------------------------------------------- */

type Item = Record<string, unknown>;

/** Drops incomplete conditions and, recursively, groups left with nothing in them. */
function prune(nodes: FilterNode[], d: FilterDescriptor): FilterNode[] {
    const out: FilterNode[] = [];
    for (const node of nodes) {
        if (node.kind === 'condition') {
            if (isComplete(node, d)) out.push(node);
        } else {
            const children = prune(node.children, d);
            if (children.length > 0) out.push({ ...node, children });
        }
    }
    return out;
}

const valueOf = (c: ConditionNode, d: FilterDescriptor) =>
    findOperator(d, c.field, c.operator)?.valueKind === 'none' ? true : c.value;

/** An array item: a single condition, or a single group key holding its own items. */
function toItem(node: FilterNode, d: FilterDescriptor): Item {
    if (node.kind === 'condition') return { [node.field]: { [node.operator as string]: valueOf(node, d) } };
    return { [d.keys[node.combinator]]: node.children.map(c => toItem(c, d)) };
}

/**
 * Canonical output (see the header comment). Incomplete conditions and empty groups are dropped.
 * `filterOperator` is only emitted for 'OR', since 'AND' is the API default.
 */
export function toQuery(state: FilterState, d: FilterDescriptor): FilterInput & { filter: FilterQuery } {
    const { root } = state;
    const kids = prune(root.children, d);
    const filter: FilterQuery = {};

    const topLevelHas = (c: ConditionNode) =>
        (filter[c.field] as Record<string, unknown> | undefined)?.[c.operator as string] !== undefined;
    const mergeTop = (c: ConditionNode) => {
        filter[c.field] = {
            ...(filter[c.field] as object | undefined),
            [c.operator as string]: valueOf(c, d),
        };
    };

    if (root.combinator === 'and') {
        const extras: Item[] = [];
        for (const kid of kids) {
            // A repeated field+operator can't share one top-level object, so it moves into `_and`.
            // Without an `_and` key in the schema the UI never produces one; last wins as a fallback.
            if (kid.kind === 'condition' && (!topLevelHas(kid) || !d.groups.and)) mergeTop(kid);
            else extras.push(toItem(kid, d));
        }
        if (extras.length > 0) filter[d.keys.and] = extras;
    } else {
        const conditions = kids.filter(isCondition);
        const flat =
            conditions.length === kids.length &&
            new Set(conditions.map(c => c.field)).size === conditions.length;
        if (flat || !d.groups.or) {
            conditions.forEach(mergeTop);
        } else {
            filter[d.keys.or] = kids.map(k => toItem(k, d));
        }
    }

    return root.combinator === 'or' ? { filter, filterOperator: FilterGroupOperator.OR } : { filter };
}

/* -------------------------------------------------------------------------- */
/*  Query -> state                                                            */
/* -------------------------------------------------------------------------- */

class Refusal extends Error {}

function refuse(message: string): never {
    throw new Refusal(message);
}

/** Turns `{ field: { op: value, op2: value } }` into one condition per operator, validating each. */
function parseFields(
    obj: Record<string, unknown>,
    d: FilterDescriptor,
    makeId: () => string,
): ConditionNode[] {
    const out: ConditionNode[] = [];
    for (const [field, ops] of Object.entries(obj)) {
        if (ops === undefined) continue;
        const fieldDesc = d.fields.find(f => f.name === field);
        if (!fieldDesc) refuse(`unknown field "${field}"`);
        if (!isPlainObject(ops)) refuse(`"${field}" must be an object of operators`);

        for (const [operator, value] of Object.entries(ops)) {
            if (value === undefined) continue;
            const opDesc = fieldDesc.operators.find(o => o.key === operator);
            if (!opDesc) refuse(`unknown operator "${field}.${operator}"`);

            if (opDesc.valueKind === 'none') {
                if (value !== true) refuse(`"${field}.${operator}" only supports true`);
            } else if (!opDesc.valueSchema.safeParse(value).success) {
                refuse(`invalid value for "${field}.${operator}"`);
            }
            out.push({ kind: 'condition', id: makeId(), field, operator, value });
        }
    }
    return out;
}

/** Separates a filter object into its field entries and its `_and` / `_or` values. */
function splitItem(item: unknown, d: FilterDescriptor) {
    if (!isPlainObject(item)) refuse('expected an object of fields');
    const fields: Record<string, unknown> = {};
    let and: unknown;
    let or: unknown;
    for (const [key, value] of Object.entries(item)) {
        if (value === undefined) continue;
        if (key === d.keys.and) and = value;
        else if (key === d.keys.or) or = value;
        else fields[key] = value;
    }
    return { fields, and, or };
}

/** Everything in an `_and` / `_or` array, as the children of a group. */
function parseList(
    combinator: Combinator,
    items: unknown,
    d: FilterDescriptor,
    makeId: () => string,
): FilterNode[] {
    const key = d.keys[combinator];
    if (!d.groups[combinator]) refuse(`"${key}" is not supported by this schema`);
    if (!Array.isArray(items)) refuse(`"${key}" must be an array`);
    return combinator === 'and'
        ? items.flatMap(item => parseAndItem(item, d, makeId))
        : items.map(item => parseOrItem(item, d, makeId));
}

function parseGroup(
    combinator: Combinator,
    items: unknown,
    d: FilterDescriptor,
    makeId: () => string,
): GroupNode {
    if (!d.groups[combinator]) refuse(`"${d.keys[combinator]}" is not supported by this schema`);
    if (!groupsEnabled(d)) refuse('nested groups need both "_and" and "_or" in the schema');
    const children = parseList(combinator, items, d, makeId);
    return { kind: 'group', id: makeId(), combinator, children };
}

/** An object in an AND context: its fields and nested groups are all ANDed, so they flatten. */
function parseAndItem(item: unknown, d: FilterDescriptor, makeId: () => string): FilterNode[] {
    const { fields, and, or } = splitItem(item, d);
    const out: FilterNode[] = parseFields(fields, d, makeId);
    if (and !== undefined) out.push(parseGroup('and', and, d, makeId));
    if (or !== undefined) out.push(parseGroup('or', or, d, makeId));
    return out;
}

/**
 * An `_or` item must be exactly one condition or one group. `{ a, b }` could mean a AND b or
 * a OR b depending on the service, so it is refused rather than guessed.
 */
function parseOrItem(item: unknown, d: FilterDescriptor, makeId: () => string): FilterNode {
    const nodes = parseAndItem(item, d, makeId);
    if (nodes.length !== 1) refuse(`each "${d.keys.or}" item must be a single condition or group`);
    return nodes[0];
}

function parseInput(input: unknown, d: FilterDescriptor, makeId: () => string): FilterState {
    if (input === null || input === undefined) return emptyState();
    if (!isPlainObject(input)) refuse('query must be an object');

    const rawOperator = input.filterOperator;
    const operator = typeof rawOperator === 'string' ? rawOperator.toUpperCase() : rawOperator;
    if (
        operator !== undefined &&
        operator !== FilterGroupOperator.AND &&
        operator !== FilterGroupOperator.OR
    ) {
        refuse('filterOperator must be "AND" or "OR"');
    }
    const state = emptyState(operator === FilterGroupOperator.OR ? 'or' : 'and');
    if (input.filter === undefined || input.filter === null) return state;

    const { fields, and, or } = splitItem(input.filter, d);
    const fieldConditions = parseFields(fields, d, makeId);
    const children = state.root.children;

    if (state.root.combinator === 'and') {
        // Every part is ANDed together, so the order of parts doesn't matter semantically.
        children.push(...fieldConditions);
        if (and !== undefined) children.push(...parseList('and', and, d, makeId));
        if (or !== undefined) children.push(parseGroup('or', or, d, makeId));
        return state;
    }

    // filterOperator 'OR': only shapes with one unambiguous reading are accepted.
    const hasFields = fieldConditions.length > 0;
    if (hasFields && and === undefined && or === undefined) {
        const perField = new Set(fieldConditions.map(c => c.field));
        if (perField.size !== fieldConditions.length) {
            refuse(
                'with filterOperator "OR", a field with several operators is ambiguous (AND within the field, or OR?)',
            );
        }
        children.push(...fieldConditions);
    } else if (!hasFields && and === undefined && or !== undefined) {
        children.push(...parseList('or', or, d, makeId));
    } else if (!hasFields && or === undefined && and !== undefined) {
        children.push(parseGroup('and', and, d, makeId));
    } else if (hasFields || and !== undefined || or !== undefined) {
        refuse('with filterOperator "OR", top-level fields next to "_and" / "_or" are ambiguous');
    }
    return state;
}

/**
 * Parses `{ filter, filterOperator }` into a tree, or explains why the UI can't represent it.
 * Nested groups, unknown fields/operators and invalid values are refused, never silently dropped.
 */
export function fromQuery(
    input: unknown,
    d: FilterDescriptor,
    makeId: () => string = defaultId,
): ParseResult {
    try {
        return { ok: true, state: parseInput(input, d, makeId) };
    } catch (error) {
        if (error instanceof Refusal) return { ok: false, reason: error.message };
        throw error;
    }
}

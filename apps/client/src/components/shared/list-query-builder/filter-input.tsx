import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FilterFieldDescriptor, FilterOperatorDescriptor } from '@/lib/list-query-builder/types';
import { humanize, unwrap } from '@/lib/list-query-builder/utils';
import { X } from 'lucide-react';
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import type { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  Registry types                                                            */
/* -------------------------------------------------------------------------- */

/** Props for ONE input: a single value, or one bound of a range. */
export interface ScalarInputProps {
    value: unknown;
    onChange: (value: unknown) => void;
    /** Schema of this one input (unwrapped by the descriptor when possible). */
    schema: z.ZodType | null;
    field: FilterFieldDescriptor;
    operator: FilterOperatorDescriptor;
    invalid: boolean;
    'aria-label': string;
}

export type ScalarInputRenderer = (props: ScalarInputProps) => ReactNode;

/**
 * Overrides for the scalar input. Resolution order: fieldInputs[field name], then
 * inputs[filterType], then the built-in input chosen from the value schema.
 * They apply to 'single' operators and to each bound of 'range' operators.
 */
export interface FilterInputRegistry {
    inputs?: Record<string, ScalarInputRenderer>;
    fieldInputs?: Record<string, ScalarInputRenderer>;
}

/* -------------------------------------------------------------------------- */
/*  Operator labels                                                           */
/* -------------------------------------------------------------------------- */

export const DEFAULT_OPERATOR_LABELS: Record<string, string> = {
    equals: 'equals',
    not: 'does not equal',
    notEquals: 'does not equal',
    contains: 'contains',
    notContains: 'does not contain',
    startsWith: 'starts with',
    endsWith: 'ends with',
    in: 'is one of',
    notIn: 'is not one of',
    gt: 'is greater than',
    gte: 'is at least',
    lt: 'is less than',
    lte: 'is at most',
    between: 'is between',
    notNull: 'is set',
    isNull: 'is empty',
    isEmpty: 'is empty',
    isNotEmpty: 'is not empty',
};

export function operatorLabel(key: string, overrides?: Record<string, string>): string {
    const label = overrides?.[key] ?? DEFAULT_OPERATOR_LABELS[key] ?? humanize(key);
    return label.toLowerCase();
}

/* -------------------------------------------------------------------------- */
/*  Scalar classification                                                     */
/* -------------------------------------------------------------------------- */

type ScalarKind =
    | { type: 'text' }
    | { type: 'number' }
    | { type: 'boolean' }
    | { type: 'enum'; options: string[] }
    | { type: 'date'; as: 'object' | 'string' };

export function scalarKind(schema: z.ZodType | null, filterType: string): ScalarKind {
    if (schema) {
        const def = unwrap(schema).def as unknown as { type: string; entries?: Record<string, string> };
        switch (def.type) {
            case 'number':
                return { type: 'number' };
            case 'boolean':
                return { type: 'boolean' };
            case 'enum':
                return { type: 'enum', options: Object.values(def.entries ?? {}).map(String) };
            case 'date':
                return { type: 'date', as: 'object' };
        }
    }
    return filterType === 'date' ? { type: 'date', as: 'string' } : { type: 'text' };
}

/* -------------------------------------------------------------------------- */
/*  Built-in scalar input                                                     */
/* -------------------------------------------------------------------------- */

export function DefaultScalarInput({
    value,
    onChange,
    schema,
    field,
    invalid,
    'aria-label': ariaLabel,
}: ScalarInputProps) {
    const kind = scalarKind(schema, field.filterType);
    const common = { 'aria-label': ariaLabel, 'aria-invalid': invalid || undefined };

    switch (kind.type) {
        case 'number':
            return (
                <Input
                    {...common}
                    type="number"
                    inputMode="decimal"
                    value={typeof value === 'number' ? value : ''}
                    onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                />
            );

        case 'date': {
            const text =
                kind.as === 'object'
                    ? value instanceof Date && !Number.isNaN(value.getTime())
                        ? value.toISOString().slice(0, 10)
                        : ''
                    : typeof value === 'string'
                      ? value
                      : '';
            return (
                <Input
                    {...common}
                    type="date"
                    value={text}
                    onChange={e => {
                        const v = e.target.value;
                        onChange(
                            v === '' ? undefined : kind.as === 'object' ? new Date(`${v}T00:00:00.000Z`) : v,
                        );
                    }}
                />
            );
        }

        case 'boolean':
            return (
                <Select
                    value={typeof value === 'boolean' ? String(value) : ''}
                    onValueChange={v => onChange(v === 'true')}
                >
                    <SelectTrigger {...common}>
                        <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                </Select>
            );

        case 'enum':
            return (
                <Select value={typeof value === 'string' ? value : ''} onValueChange={v => onChange(v)}>
                    <SelectTrigger {...common}>
                        <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                        {kind.options.map(o => (
                            <SelectItem key={o} value={o}>
                                {humanize(o)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );

        default:
            return (
                <Input
                    {...common}
                    value={typeof value === 'string' ? value : ''}
                    onChange={e => onChange(e.target.value === '' ? undefined : e.target.value)}
                />
            );
    }
}

/* -------------------------------------------------------------------------- */
/*  List input                                                                */
/* -------------------------------------------------------------------------- */

interface ListInputProps {
    value: unknown;
    onChange: (value: unknown) => void;
    schema: z.ZodType | null;
    field: FilterFieldDescriptor;
    invalid: boolean;
    ariaLabel: string;
}

const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** Lists of enum values are a set of toggle chips. */
function EnumListInput({
    value,
    onChange,
    options,
    ariaLabel,
}: Pick<ListInputProps, 'value' | 'onChange' | 'ariaLabel'> & { options: string[] }) {
    const items = asList(value);
    return (
        <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
            {options.map(opt => {
                const on = items.includes(opt);
                return (
                    <button
                        key={opt}
                        type="button"
                        aria-pressed={on}
                        onClick={() => onChange(on ? items.filter(x => x !== opt) : [...items, opt])}
                    >
                        <Badge variant={on ? 'default' : 'outline'}>{humanize(opt)}</Badge>
                    </button>
                );
            })}
        </div>
    );
}

/** Free-entry lists: type a value, press Enter or comma to add it as a chip. */
function FreeListInput({ value, onChange, schema, field, invalid, ariaLabel }: ListInputProps) {
    const [draft, setDraft] = useState('');
    const items = asList(value);
    const isNumber = scalarKind(schema, field.filterType).type === 'number';

    const commit = (text: string) => {
        const parts = text
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
            .map(t => (isNumber ? Number(t) : t))
            .filter(t => !(typeof t === 'number' && !Number.isFinite(t)))
            .filter(t => !items.includes(t));
        if (parts.length > 0) onChange([...items, ...parts]);
        setDraft('');
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit(draft);
        } else if (e.key === 'Backspace' && draft === '' && items.length > 0) {
            onChange(items.slice(0, -1));
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {items.map(item => (
                <Badge key={String(item)} variant="secondary" className="gap-1">
                    {String(item)}
                    <button
                        type="button"
                        aria-label={`Remove ${String(item)}`}
                        onClick={() => onChange(items.filter(x => x !== item))}
                    >
                        <X className="size-3" />
                    </button>
                </Badge>
            ))}
            <Input
                aria-label={ariaLabel}
                aria-invalid={invalid || undefined}
                className="min-w-32 flex-1"
                placeholder="Type and press Enter"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => commit(draft)}
            />
        </div>
    );
}

function ListInput(props: ListInputProps) {
    const kind = scalarKind(props.schema, props.field.filterType);
    return kind.type === 'enum' ? (
        <EnumListInput
            value={props.value}
            onChange={props.onChange}
            options={kind.options}
            ariaLabel={props.ariaLabel}
        />
    ) : (
        <FreeListInput {...props} />
    );
}

/* -------------------------------------------------------------------------- */
/*  Value input (picks by operator valueKind)                                 */
/* -------------------------------------------------------------------------- */

export interface ValueInputProps extends FilterInputRegistry {
    field: FilterFieldDescriptor;
    operator: FilterOperatorDescriptor;
    value: unknown;
    onChange: (value: unknown) => void;
    invalid: boolean;
}

export function ValueInput({
    field,
    operator,
    value,
    onChange,
    invalid,
    inputs,
    fieldInputs,
}: ValueInputProps) {
    const custom = fieldInputs?.[field.name] ?? inputs?.[field.filterType];

    const scalar = (v: unknown, set: (v: unknown) => void, ariaLabel: string) => {
        const props: ScalarInputProps = {
            value: v,
            onChange: set,
            schema: operator.inputSchema,
            field,
            operator,
            invalid,
            'aria-label': ariaLabel,
        };
        return custom ? custom(props) : <DefaultScalarInput {...props} />;
    };

    switch (operator.valueKind) {
        case 'none':
            return null;

        case 'single':
            return <>{scalar(value, onChange, 'Value')}</>;

        case 'list':
            return (
                <ListInput
                    value={value}
                    onChange={onChange}
                    schema={operator.inputSchema}
                    field={field}
                    invalid={invalid}
                    ariaLabel="Value"
                />
            );

        case 'range': {
            const keys = operator.rangeKeys;
            const get = (i: 0 | 1) =>
                keys ? (value as any)?.[keys[i]] : Array.isArray(value) ? value[i] : undefined;
            const set = (i: 0 | 1, v: unknown) => {
                const bounds: unknown[] = [get(0), get(1)];
                bounds[i] = v;
                if (bounds.every(b => b === undefined)) return onChange(undefined);
                onChange(keys ? { [keys[0]]: bounds[0], [keys[1]]: bounds[1] } : bounds);
            };
            return (
                <div className="flex flex-1 items-center gap-2">
                    {scalar(get(0), v => set(0, v), 'Value from')}
                    <span className="text-sm text-muted-foreground">and</span>
                    {scalar(get(1), v => set(1, v), 'Value to')}
                </div>
            );
        }
    }
}

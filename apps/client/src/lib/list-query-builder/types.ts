import type { SortDirection } from '@snippetly/common/dto';
import type z from 'zod';

export interface FilterFieldDescriptor {
    name: string;
    label: string;
    filterType: string;
    operators: any[];
}

export interface IntrospectFilterSchemaOptions {
    /** Label overrides by field name (UI-side wording stays out of the API schema). */
    labels?: Record<string, string>;
    /** Boolean operators with these keys take no input. */
    flagOperators?: string[];
    /**@default _and */
    andKey?: string;
    /**@default _or */
    orKey?: string;
}

export type ValueKind = 'single' | 'list' | 'range' | 'none';

export interface FilterOperatorDescriptor {
    key: string;
    valueKind: ValueKind;
    /** Operator value schema with optional/nullable/default stripped. Use for validation. */
    valueSchema: z.ZodType;
    /** Schema of ONE input: the value, a list item, or a range bound. Null for 'none'. */
    inputSchema: z.ZodType | null;
    /** For 'range': object keys of the two bounds, or null when the range is a 2-tuple. */
    rangeKeys: [string, string] | null;
}

export interface FilterDescriptor {
    fields: FilterFieldDescriptor[];
    /** Which top-level filter grouping the schema supports. */
    groups: { and: boolean; or: boolean };
    /** Key names used for the filter groups on the wire. */
    keys: { and: string; or: string };
}

export interface IntrospectSortSchemaOptions {
    /** Label overrides by field name (UI-side wording stays out of the API schema). */
    labels?: Record<string, string>;
}

export interface SortFieldDescriptor {
    name: string;
    label: string;
    directions: SortDirection[];
}

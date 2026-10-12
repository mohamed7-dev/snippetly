import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFilterBuilder } from '@/hooks/list-query-builder/use-filter-builder';
import {
    collectConditions,
    fromQuery,
    type FilterInput,
    type FilterOperator,
    type FilterQuery,
} from '@/lib/list-query-builder/filter-codec';
import { introspectFilterSchema } from '@/lib/list-query-builder/introspect-filter-schema';
import type { FilterDescriptor, IntrospectFilterSchemaOptions } from '@/lib/list-query-builder/types';
import { Filter } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import type { z } from 'zod';
import { FilterBuilderView } from './filter-builder-view';
import type { FilterInputRegistry } from './filter-input';

/** Shaped like the filter part of a listing input. */
export interface FilterDialogValue<S extends z.ZodType> {
    filter?: z.input<S>;
    filterOperator?: FilterOperator;
}

export interface FilterDialogProps<S extends z.ZodType>
    extends FilterInputRegistry, IntrospectFilterSchemaOptions {
    /** The filter schema: top-level fields of operator objects, plus `_and` / `_or` for nesting. */
    schema: S;
    /** The applied `{ filter, filterOperator }` (controlled). Omit to let the dialog remember it. */
    value?: FilterDialogValue<S>;
    defaultValue?: FilterDialogValue<S>;
    /** Called on Apply with a value you can spread into the listing input. */
    onApply?: (value: { filter: z.input<S>; filterOperator?: FilterOperator }) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Custom trigger element, or null to render none (open it through `open`). */
    trigger?: ReactNode | null;
    title?: ReactNode;
    description?: ReactNode;
    operatorLabels?: Record<string, string>;
}

export function FilterQueryDialog<S extends z.ZodType>({
    schema,
    value,
    defaultValue,
    onApply,
    open: openProp,
    onOpenChange,
    trigger,
    title = 'Filters',
    description = 'Choose the conditions records must match. Groups can be nested.',
    operatorLabels,
    inputs,
    fieldInputs,
    labels,
    andKey,
    orKey,
    flagOperators,
}: FilterDialogProps<S>) {
    const labelsKey = labels ? JSON.stringify(labels) : '';
    const flagsKey = flagOperators ? flagOperators.join('\u0000') : '';
    const descriptor = useMemo(
        () => introspectFilterSchema(schema, { labels, andKey, orKey, flagOperators }),
        [schema, labelsKey, andKey, orKey, flagsKey],
    );

    const [internalOpen, setInternalOpen] = useState(false);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
        setInternalOpen(next);
        onOpenChange?.(next);
    };

    const [internalApplied, setInternalApplied] = useState<FilterInput>({
        filter: (defaultValue?.filter ?? {}) as FilterQuery,
        filterOperator: defaultValue?.filterOperator,
    });
    const applied: FilterInput = value
        ? { filter: (value.filter ?? {}) as FilterQuery, filterOperator: value.filterOperator }
        : internalApplied;

    const activeCount = useMemo(() => {
        const parsed = fromQuery(applied, descriptor);
        return parsed.ok ? collectConditions(parsed.state.root).length : null;
    }, [applied.filter, applied.filterOperator, descriptor]);

    const apply = (next: FilterInput & { filter: FilterQuery }) => {
        setInternalApplied(next);
        onApply?.(next as { filter: z.input<S>; filterOperator?: FilterOperator });
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            {trigger !== null && (
                <AlertDialogTrigger asChild>
                    {trigger ?? (
                        <Button variant="outline">
                            <Filter className="size-4" />
                            Filters
                            {activeCount ? <Badge variant="secondary">{activeCount}</Badge> : null}
                        </Button>
                    )}
                </AlertDialogTrigger>
            )}
            <AlertDialogContent className="sm:max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                {/* The body mounts when the dialog opens, so every open starts from the applied value
            and abandoned edits are discarded. */}
                <FilterDialogBody
                    descriptor={descriptor}
                    initial={applied}
                    onApply={apply}
                    onCancel={() => setOpen(false)}
                    operatorLabels={operatorLabels}
                    inputs={inputs}
                    fieldInputs={fieldInputs}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}

interface BodyProps extends FilterInputRegistry {
    descriptor: FilterDescriptor;
    initial: FilterInput;
    onApply: (input: FilterInput & { filter: FilterQuery }) => void;
    onCancel: () => void;
    operatorLabels?: Record<string, string>;
}

function FilterDialogBody({
    descriptor,
    initial,
    onApply,
    onCancel,
    operatorLabels,
    inputs,
    fieldInputs,
}: BodyProps) {
    const builder = useFilterBuilder(descriptor, { defaultValue: initial });
    const hasError = builder.rows.some(r => r.error);
    const ignored = builder.rows.filter(r => !r.complete).length;

    return (
        <>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
                <FilterBuilderView
                    builder={builder}
                    operatorLabels={operatorLabels}
                    inputs={inputs}
                    fieldInputs={fieldInputs}
                />
            </div>

            {ignored > 0 && !builder.unsupported && (
                <p className="text-xs text-muted-foreground">
                    {ignored === 1
                        ? '1 incomplete filter will be ignored.'
                        : `${ignored} incomplete filters will be ignored.`}
                </p>
            )}

            <AlertDialogFooter className="gap-2 sm:justify-between">
                <Button type="button" variant="ghost" disabled={builder.isEmpty} onClick={builder.clear}>
                    Clear all
                </Button>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={hasError || !!builder.unsupported}
                        onClick={() => onApply(builder.query)}
                    >
                        Apply
                    </Button>
                </div>
            </AlertDialogFooter>
        </>
    );
}

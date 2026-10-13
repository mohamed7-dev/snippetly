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
import { useSortBuilder } from '@/hooks/list-query-builder/use-sort-builder';
import { introspectSortSchema } from '@/lib/list-query-builder/introspect-sort-schema';
import { fromSortQuery, type SortQuery } from '@/lib/list-query-builder/sort-codec';
import type { SortFieldDescriptor } from '@/lib/list-query-builder/types';
import { ListFilter } from 'lucide-react';
import React, { useMemo, useState, type ReactNode } from 'react';
import type { z } from 'zod';
import { SortBuilderView } from './sort-builder-view';

/** Shaped like the query part of a listing input, so it can be spread straight into the request. */
export interface QueryValue<S extends z.ZodType> {
    sort?: z.input<S>;
}

export interface SortQueryDialogProps<S extends z.ZodType> {
    /** Sort schema. */
    sortSchema: S;
    /** Applied `{ filter, filterOperator, sort }` (controlled). Omit to let the dialog remember it. */
    value?: QueryValue<S>;
    defaultValue?: QueryValue<S>;
    /** Called on Apply with only the sections whose schema was provided. */
    onApply?: (value: QueryValue<S>) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Custom trigger element, or null to render none (open it through `open`). */
    trigger?: ReactNode | null;
    title?: ReactNode;
    description?: ReactNode;
    sortLabels?: Record<string, string>;
    directionLabels?: Record<string, string>;
}

const NO_SORT: SortFieldDescriptor[] = [];

export function SortQueryDialog<S extends z.ZodType = z.ZodType>({
    sortSchema,
    value,
    defaultValue,
    onApply,
    open: openProp,
    onOpenChange,
    trigger,
    title,
    description,
    sortLabels,
    directionLabels,
}: SortQueryDialogProps<S>) {
    const hasSort = !!sortSchema;

    const sortKey = sortLabels ? JSON.stringify(sortLabels) : '';
    const sortFields = useMemo(
        () => (sortSchema ? introspectSortSchema(sortSchema, { labels: sortLabels }) : NO_SORT),
        [sortSchema, sortKey],
    );

    const [internalOpen, setInternalOpen] = useState(false);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
        setInternalOpen(next);
        onOpenChange?.(next);
    };

    const [internal, setInternal] = useState<{ sort: SortQuery }>({
        sort: (defaultValue?.sort ?? {}) as SortQuery,
    });

    const appliedSort = (value?.sort ?? internal.sort) as SortQuery;

    const activeCount = useMemo(() => {
        const s = hasSort ? fromSortQuery(appliedSort, sortFields) : null;
        return s?.ok ? s.items.length : 0;
    }, [appliedSort, sortFields, hasSort]);
    const apply = (next: { sort?: SortQuery }) => {
        setInternal(prev => ({ sort: next.sort ?? prev.sort }));
        onApply?.({
            ...(next.sort ? { sort: next.sort } : {}),
        } as QueryValue<S>);
        setOpen(false);
    };

    const triggerLabel = 'Sort';

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            {trigger !== null && (
                <AlertDialogTrigger asChild>
                    {trigger ?? (
                        <Button variant="outline">
                            <ListFilter className="size-4" />
                            {triggerLabel}
                            {activeCount > 0 ? <Badge variant="secondary">{activeCount}</Badge> : null}
                        </Button>
                    )}
                </AlertDialogTrigger>
            )}
            <AlertDialogContent className="sm:max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title ?? triggerLabel}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description ?? 'Choose how results are ordered.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <QueryDialogBody
                    hasSort={hasSort}
                    sortFields={sortFields}
                    initialSort={appliedSort}
                    onApply={apply}
                    onCancel={() => setOpen(false)}
                    directionLabels={directionLabels}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}

interface BodyProps {
    hasSort: boolean;
    sortFields: SortFieldDescriptor[];
    initialSort: SortQuery;
    onApply: (next: { sort?: SortQuery }) => void;
    onCancel: () => void;
    directionLabels?: Record<string, string>;
}

function QueryDialogBody({
    hasSort,
    sortFields,
    initialSort,
    onApply,
    onCancel,
    directionLabels,
}: BodyProps) {
    const sort = useSortBuilder(sortFields, { defaultValue: initialSort });

    const blocked = hasSort && !!sort.unsupported;
    const nothingToClear = !hasSort || sort.rows.length === 0;

    return (
        <React.Fragment>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {hasSort && (
                    <section aria-label="Sorting">
                        <SortBuilderView builder={sort} directionLabels={directionLabels} />
                    </section>
                )}
            </div>

            <AlertDialogFooter className="gap-2 sm:justify-between">
                <Button
                    type="button"
                    variant="ghost"
                    disabled={nothingToClear}
                    onClick={() => {
                        if (hasSort) sort.clear();
                    }}
                >
                    Clear all
                </Button>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={blocked}
                        onClick={() =>
                            onApply({
                                ...(hasSort ? { sort: sort.query } : {}),
                            })
                        }
                    >
                        Apply
                    </Button>
                </div>
            </AlertDialogFooter>
        </React.Fragment>
    );
}

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SortBuilder } from '@/hooks/list-query-builder/use-sort-builder';
import { humanize } from '@/lib/list-query-builder/utils';
import type { SortDirection } from '@snippetly/common/dto';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

export const DEFAULT_DIRECTION_LABELS: Record<string, string> = {
    ASC: 'Ascending',
    DESC: 'Descending',
};

export function directionLabel(direction: string, overrides?: Record<string, string>): string {
    return overrides?.[direction] ?? DEFAULT_DIRECTION_LABELS[direction] ?? humanize(direction);
}

export interface SortBuilderViewProps {
    /** The object returned by useSortBuilder. */
    builder: SortBuilder;
    /** Overrides for direction display text, by enum value. */
    directionLabels?: Record<string, string>;
    emptyMessage?: ReactNode;
    addLabel?: string;
}

/** Renders the ordered sort rows with reorder, field, direction, remove and add controls. */
export function SortBuilderView({
    builder,
    directionLabels,
    emptyMessage = 'No sorting applied. Add a field to order the results.',
    addLabel = 'Add sort',
}: SortBuilderViewProps) {
    if (builder.unsupported) {
        return (
            <div role="alert" className="space-y-3 rounded-md border border-destructive/50 p-4 text-sm">
                <p className="font-medium">This sort can't be edited here.</p>
                <p className="text-muted-foreground">{builder.unsupported}</p>
                <Button type="button" variant="outline" size="sm" onClick={builder.reset}>
                    Reset sorting
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {builder.rows.length === 0 && <p className="text-sm text-muted-foreground">{emptyMessage}</p>}

            <ol className="space-y-2">
                {builder.rows.map(row => (
                    <li
                        key={row.id}
                        role="group"
                        aria-label={`Sort ${row.index + 1}`}
                        className="flex flex-wrap items-center gap-2"
                    >
                        <span className="w-16 shrink-0 text-sm text-muted-foreground">
                            {row.index === 0 ? 'Sort by' : 'Then by'}
                        </span>

                        <Select
                            value={row.field?.name ?? ''}
                            onValueChange={name => builder.setField(row.id, name)}
                        >
                            <SelectTrigger aria-label="Sort field" className="w-44">
                                <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                                {row.fields.map(f => (
                                    <SelectItem key={f.name} value={f.name}>
                                        {f.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={row.direction}
                            onValueChange={d => builder.setDirection(row.id, d as SortDirection)}
                        >
                            <SelectTrigger aria-label="Sort direction" className="w-40">
                                <SelectValue placeholder="Direction" />
                            </SelectTrigger>
                            <SelectContent>
                                {row.directions.map(d => (
                                    <SelectItem key={d} value={d}>
                                        {directionLabel(d, directionLabels)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="ml-auto flex items-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Move sort up"
                                disabled={!row.canMoveUp}
                                onClick={() => builder.move(row.id, row.index - 1)}
                            >
                                <ArrowUp className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Move sort down"
                                disabled={!row.canMoveDown}
                                onClick={() => builder.move(row.id, row.index + 1)}
                            >
                                <ArrowDown className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Remove sort"
                                onClick={() => builder.remove(row.id)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </li>
                ))}
            </ol>

            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!builder.canAdd}
                onClick={() => builder.add()}
            >
                <Plus className="size-4" />
                {addLabel}
            </Button>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FilterBuilder, FilterRow, GroupView } from '@/hooks/list-query-builder/use-filter-builder';
import type { Combinator } from '@/lib/list-query-builder/filter-codec';
import { FolderPlus, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { operatorLabel, ValueInput, type FilterInputRegistry } from './filter-input';

export interface FilterBuilderViewProps extends FilterInputRegistry {
    /** The object returned by useFilterBuilder. */
    builder: FilterBuilder;
    /** Overrides for operator display text, by operator key. */
    operatorLabels?: Record<string, string>;
    emptyMessage?: ReactNode;
    addLabel?: string;
    addGroupLabel?: string;
}

interface Shared extends FilterInputRegistry {
    builder: FilterBuilder;
    operatorLabels?: Record<string, string>;
    emptyMessage: ReactNode;
    addLabel: string;
    addGroupLabel: string;
}

/**
 * Renders the filter tree: the root group (whose combinator is `filterOperator`), its conditions and
 * any nested groups, to any depth. Holds no state of its own.
 */
export function FilterBuilderView({
    builder,
    operatorLabels,
    emptyMessage = 'No filters yet. Add one to narrow down the results.',
    addLabel = 'Add filter',
    addGroupLabel = 'Add group',
    inputs,
    fieldInputs,
}: FilterBuilderViewProps) {
    if (builder.unsupported) {
        return (
            <div role="alert" className="space-y-3 rounded-md border border-destructive/50 p-4 text-sm">
                <p className="font-medium">This filter is too complex to edit here.</p>
                <p className="text-muted-foreground">{builder.unsupported}</p>
                <Button type="button" variant="outline" size="sm" onClick={builder.reset}>
                    Reset filters
                </Button>
            </div>
        );
    }

    return (
        <GroupBox
            group={builder.tree}
            path=""
            shared={{ builder, operatorLabels, emptyMessage, addLabel, addGroupLabel, inputs, fieldInputs }}
        />
    );
}

/* -------------------------------------------------------------------------- */
/*  Group                                                                     */
/* -------------------------------------------------------------------------- */

function GroupBox({ group, path, shared }: { group: GroupView; path: string; shared: Shared }) {
    const { builder, addLabel, addGroupLabel, emptyMessage } = shared;
    const nested = !group.isRoot;
    // The root toggle is `filterOperator`; it only means something once there are 2+ children.
    const showToggle = nested || group.children.length > 1;

    let rowNumber = 0;
    let groupNumber = 0;

    return (
        <div
            role={nested ? 'group' : undefined}
            aria-label={nested ? `Group ${path}` : undefined}
            className={nested ? 'space-y-3 rounded-md border bg-muted/30 p-3' : 'space-y-3'}
        >
            {(showToggle || nested) && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {showToggle && (
                        <>
                            <span>Match</span>
                            <div
                                role="group"
                                aria-label="Match mode"
                                className="inline-flex gap-0.5 rounded-md border bg-background p-0.5"
                            >
                                {(['and', 'or'] as Combinator[]).map(c => (
                                    <Button
                                        key={c}
                                        type="button"
                                        size="sm"
                                        variant={group.combinator === c ? 'default' : 'ghost'}
                                        aria-pressed={group.combinator === c}
                                        onClick={() => builder.setCombinator(group.id, c)}
                                    >
                                        {c === 'and' ? 'All' : 'Any'}
                                    </Button>
                                ))}
                            </div>
                            <span className="text-muted-foreground">of the following</span>
                        </>
                    )}
                    {nested && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="ml-auto"
                            aria-label="Remove group"
                            onClick={() => builder.remove(group.id)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                </div>
            )}

            {group.children.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    {nested ? 'This group is empty.' : emptyMessage}
                </p>
            )}

            <ul className="space-y-2">
                {group.children.map(child => {
                    if (child.type === 'group') {
                        groupNumber += 1;
                        const childPath = path ? `${path}.${groupNumber}` : String(groupNumber);
                        return (
                            <li key={child.group.id}>
                                <GroupBox group={child.group} path={childPath} shared={shared} />
                            </li>
                        );
                    }
                    rowNumber += 1;
                    return (
                        <RowBox
                            key={child.row.id}
                            row={child.row}
                            label={`Filter ${rowNumber}`}
                            shared={shared}
                        />
                    );
                })}
            </ul>

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!group.canAddCondition}
                    onClick={() => builder.addCondition(group.id)}
                >
                    <Plus className="size-4" />
                    {addLabel}
                </Button>
                {group.canAddGroup && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        // A new group starts with the opposite combinator, which is what nesting is usually for.
                        onClick={() => builder.addGroup(group.id, group.combinator === 'and' ? 'or' : 'and')}
                    >
                        <FolderPlus className="size-4" />
                        {addGroupLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Row                                                                       */
/* -------------------------------------------------------------------------- */

function RowBox({ row, label, shared }: { row: FilterRow; label: string; shared: Shared }) {
    const { builder, operatorLabels, inputs, fieldInputs } = shared;

    return (
        <li role="group" aria-label={label} className="space-y-1">
            <div className="flex flex-wrap items-start gap-2">
                <Select value={row.field?.name ?? ''} onValueChange={name => builder.setField(row.id, name)}>
                    <SelectTrigger aria-label="Field" className="w-44">
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
                    value={row.operator?.key ?? ''}
                    onValueChange={key => builder.setOperator(row.id, key)}
                >
                    <SelectTrigger aria-label="Operator" className="w-44">
                        <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                        {row.operators.map(o => (
                            <SelectItem key={o.key} value={o.key}>
                                {operatorLabel(o.key, operatorLabels)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex min-w-48 flex-1 items-center">
                    {row.field && row.operator && (
                        <ValueInput
                            field={row.field}
                            operator={row.operator}
                            value={row.value}
                            onChange={v => builder.setValue(row.id, v)}
                            invalid={!!row.error}
                            inputs={inputs}
                            fieldInputs={fieldInputs}
                        />
                    )}
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove filter"
                    onClick={() => builder.remove(row.id)}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
            {row.error && (
                <p role="alert" className="text-xs text-destructive">
                    {row.error}
                </p>
            )}
        </li>
    );
}

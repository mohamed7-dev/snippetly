import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FilterGroupOperator } from '@snippetly/common/dto';

interface TagFilterBarProps {
    tags: string[];
    selectedTags: string[];
    operator?: FilterGroupOperator;
    onChange: (tags: string[], operator: FilterGroupOperator) => void;
}

export function TagFilterBar({
    tags,
    selectedTags,
    operator = FilterGroupOperator.AND,
    onChange,
}: TagFilterBarProps) {
    const availableTags = [...new Set([...tags, ...selectedTags])].sort((a, b) => a.localeCompare(b));

    if (!availableTags.length) return null;

    const toggleTag = (tag: string) => {
        const nextTags = selectedTags.includes(tag)
            ? selectedTags.filter(value => value !== tag)
            : [...selectedTags, tag];
        onChange(nextTags, operator);
    };

    return (
        <div className="flex items-center flex-wrap gap-4">
            <span className="text-sm font-medium text-muted-foreground">Filter by tags: </span>

            <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => {
                    const selected = selectedTags.includes(tag);
                    return (
                        <Button
                            key={tag}
                            type="button"
                            size="sm"
                            variant={'link'}
                            aria-pressed={selected}
                            onClick={() => toggleTag(tag)}
                        >
                            #{tag}
                        </Button>
                    );
                })}
            </div>
            <div
                className={cn(
                    'flex flex-wrap items-center gap-2',
                    selectedTags.length > 0 && 'border border-border p-2 rounded-md',
                )}
            >
                {selectedTags.length > 1 && (
                    <div className="flex items-center gap-1" role="group" aria-label="Tag match mode">
                        <Button
                            type="button"
                            size="sm"
                            variant={operator === FilterGroupOperator.AND ? 'secondary' : 'ghost'}
                            aria-pressed={operator === FilterGroupOperator.AND}
                            onClick={() => onChange(selectedTags, FilterGroupOperator.AND)}
                        >
                            Match all
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={operator === FilterGroupOperator.OR ? 'secondary' : 'ghost'}
                            aria-pressed={operator === FilterGroupOperator.OR}
                            onClick={() => onChange(selectedTags, FilterGroupOperator.OR)}
                        >
                            Match any
                        </Button>
                    </div>
                )}
                {selectedTags.length > 0 && (
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onChange([], FilterGroupOperator.AND)}
                    >
                        Clear tags
                    </Button>
                )}
            </div>
        </div>
    );
}

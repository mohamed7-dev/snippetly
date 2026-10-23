import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { SearchIcon } from 'lucide-react';
import { useEffect, useState, type SubmitEvent } from 'react';
import { parseSearchInput } from '../lib/search-input';

type SearchBarProps = {
    initialValue?: string;
    className?: string;
};

export function SearchBar({ initialValue = '', className }: SearchBarProps) {
    const [value, setValue] = useState(initialValue);
    const navigate = useNavigate();

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = parseSearchInput(value);
        if (!parsed.term && !parsed.tags?.length) return;

        void navigate({
            to: '/search',
            search: {
                term: parsed.term,
                tags: parsed.tags,
            },
        });
    };

    return (
        <form role="search" onSubmit={onSubmit} className={cn('relative', className)}>
            <SearchIcon
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
                aria-label="Search snippets, collections, developers, or tags"
                autoComplete="off"
                className="bg-muted/50 pl-10 pr-10"
                maxLength={200}
                onChange={event => setValue(event.target.value)}
                placeholder="Search or use #tags"
                value={value}
            />
            <Button
                aria-label="Submit search"
                className="absolute right-0 top-0 size-9"
                size="icon"
                type="submit"
                variant="ghost"
            >
                <SearchIcon aria-hidden="true" className="size-4" />
            </Button>
        </form>
    );
}

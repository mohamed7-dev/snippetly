import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

export function OfflineSearchBar({
    value,
    onChange,
    placeholder,
    label,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
}) {
    return (
        <div className="relative">
            <SearchIcon
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
                aria-label={label}
                className="bg-background pl-9"
                placeholder={placeholder}
                value={value}
                onChange={event => onChange(event.target.value)}
            />
        </div>
    );
}

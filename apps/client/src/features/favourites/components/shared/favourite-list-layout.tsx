import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function FavouriteListLayout({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6', className)} />
    );
}

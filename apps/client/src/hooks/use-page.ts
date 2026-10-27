import { PageContext } from '@/components/providers/page-provider';
import React from 'react';

export function usePage() {
    const ctx = React.useContext(PageContext);
    if (!ctx) throw new Error('usePage must be used inside PageProvider');
    return ctx;
}

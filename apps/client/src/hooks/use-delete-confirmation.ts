import { DeleteConfirmationContext } from '@/components/providers/delete-confirmation-provider';
import React from 'react';

export function useDeleteConfirmation() {
    const ctx = React.useContext(DeleteConfirmationContext);
    if (!ctx) throw new Error('useDeleteConfirmation must be used inside DeleteConfirmationProvider');
    return ctx;
}

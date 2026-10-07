import type { Permission } from '@snippetly/common/dto';
import React from 'react';
import { useAuth } from './use-auth';

export function usePermissions() {
    const { user } = useAuth();

    const hasPermissions = React.useCallback(
        (permissions: string[]) => {
            const currentUserPermissions = user?.user.roles.flatMap(r => r.permissions);
            if (!currentUserPermissions) return false;
            return permissions.some(p => currentUserPermissions.includes(p as Permission));
        },
        [user],
    );

    return {
        hasPermissions,
    };
}

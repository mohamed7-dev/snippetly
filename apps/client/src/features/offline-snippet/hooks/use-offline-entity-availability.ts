import { getOfflineOwnerId, hasOfflineEditableDashboardData } from '../lib/store';
import { useAuth } from '@/features/auth/hooks/use-auth';
import React from 'react';

export function useOfflineEntityAvailability(kind: 'snippet-details' | 'collection-details', id: string) {
    const { status, user } = useAuth();
    const [isAvailable, setIsAvailable] = React.useState(false);

    React.useEffect(() => {
        let active = true;
        setIsAvailable(false);
        const ownerId = user?.id ?? getOfflineOwnerId();
        if (!ownerId) {
            return;
        }

        void hasOfflineEditableDashboardData(ownerId, kind, id)
            .then(available => {
                if (active) setIsAvailable(available);
            })
            .catch(error => {
                console.error(`Could not check offline ${kind.replace('-details', '')} cache.`, error);
                if (active) setIsAvailable(false);
            });

        return () => {
            active = false;
        };
    }, [id, kind, status, user?.id]);

    return isAvailable;
}

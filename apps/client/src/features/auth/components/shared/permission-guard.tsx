import {
    getOfflineCreationOwnerId,
    isOfflineCreationAvailable,
} from '@/features/offline-snippet/lib/offline-creation-access';
import { Permission } from '@snippetly/common/dto';
import { useAuth } from '../../hooks/use-auth';
import { usePermissions } from '../../hooks/use-permissions';

type PermissionGuardProps =
    | {
          requiredPermissions: Array<Permission.Owner | Permission>;
          ownerId: string;
          children: React.ReactNode;
          preventOwner?: boolean;
          isAvailableOffline?: boolean;
      }
    | {
          requiredPermissions: Array<Permission>;
          ownerId?: string;
          children: React.ReactNode;
          preventOwner?: boolean;
          isAvailableOffline?: boolean;
      };

export function PermissionGuard({
    requiredPermissions,
    children,
    ownerId,
    preventOwner = false,
    isAvailableOffline = false,
}: PermissionGuardProps) {
    const { hasPermissions } = usePermissions();
    const { user, status } = useAuth();

    const offlineOwnerId = isAvailableOffline ? getOfflineCreationOwnerId() : undefined;
    const canUseOfflinePermissions =
        isAvailableOffline &&
        status !== 'authenticated' &&
        isOfflineCreationAvailable() &&
        (!user?.id || user.id === offlineOwnerId);

    const currentUserId = user?.id ?? (canUseOfflinePermissions ? offlineOwnerId : undefined);

    if (ownerId && preventOwner) {
        if (currentUserId === ownerId) return null;
    }

    // handle owner permission as a special case
    if (ownerId && requiredPermissions.includes(Permission.Owner)) {
        if (currentUserId !== ownerId) return null;
    }

    if (!hasPermissions(requiredPermissions) && !canUseOfflinePermissions) return null;
    return children;
}

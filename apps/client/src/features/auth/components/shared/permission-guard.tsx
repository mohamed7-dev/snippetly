import { Permission } from '@snippetly/common/dto';
import { useAuth } from '../../hooks/use-auth';
import { usePermissions } from '../../hooks/use-permissions';

type PermissionGuardProps =
    | {
          requiredPermissions: Array<Permission.Owner | Permission>;
          ownerId: string;
          children: React.ReactNode;
          preventOwner?: boolean;
      }
    | {
          requiredPermissions: Array<Permission>;
          ownerId?: string;
          children: React.ReactNode;
          preventOwner?: boolean;
      };

export function PermissionGuard({
    requiredPermissions,
    children,
    ownerId,
    preventOwner = false,
}: PermissionGuardProps) {
    const { hasPermissions } = usePermissions();
    const { user } = useAuth();

    if (ownerId && preventOwner) {
        if (user?.id === ownerId) return null;
    }

    // handle owner permission as a special case
    if (ownerId && requiredPermissions.includes(Permission.Owner)) {
        if (user?.id !== ownerId) return null;
    }

    if (!hasPermissions(requiredPermissions)) return null;
    return children;
}

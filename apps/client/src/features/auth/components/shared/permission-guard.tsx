import { Permission } from '@snippetly/common/dto';
import { useAuth } from '../../hooks/use-auth';
import { usePermissions } from '../../hooks/use-permissions';

export function PermissionGuard({
    requiredPermissions,
    children,
    ownerId,
}: {
    requiredPermissions: Permission[];
    children: React.ReactNode;
    ownerId?: string;
}) {
    const { hasPermissions } = usePermissions();
    const { user } = useAuth();

    // handle owner permission as a special case
    if (ownerId && requiredPermissions.includes(Permission.Owner)) {
        if (user?.id !== ownerId) return null;
    }

    if (!hasPermissions(requiredPermissions)) return null;
    return children;
}

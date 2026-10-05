import type { Permission } from '@snippetly/common/dto';

export function PermissionGuard({ requiredPermissions }: { requiredPermissions: Permission[] }) {
    // TODO: read current user role's permissions
    // match requiredPermissions
    // handle owner permission as a special case

    return <div>PermissionGuard</div>;
}

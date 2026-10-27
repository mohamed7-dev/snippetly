import { User } from '../../entities/users/user.entity';

/**
 * @description
 * Retrieves all permissions for a user by combining permissions from all their roles.
 */
export function getUserPermissions(user: User): string[] {
    const permissions: string[] = [];
    for (const role of user.roles) {
        permissions.push(...role.permissions);
    }
    return permissions;
}

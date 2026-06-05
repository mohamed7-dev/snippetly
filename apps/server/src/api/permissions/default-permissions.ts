import { AppPermission, NormalizedPermission } from './permissions-factory';

export const DEFAULT_APP_PERMISSIONS = [
    new AppPermission({
        key: 'Public',
        description: 'Public permission grants access to all users',
        options: {
            assignable: false,
            internal: true,
        },
    }),
    new AppPermission({
        key: 'Authenticated',
        description: 'Authenticated permission grants access to authenticated users only',
        options: {
            internal: true,
            assignable: true,
        },
    }),
    new AppPermission({
        key: 'SuperAdmin',
        description: 'SuperAdmin permission grants unrestricted access to all operations',
        options: {
            internal: true,
            assignable: true,
        },
    }),
    new AppPermission({
        key: 'Owner',
        description:
            "Owner permission grants access to the user who owns this entity, e.g. a Developer's own Snippet",
        options: {
            assignable: false,
            internal: true,
        },
    }),
];

export function getNormalizedAppPermissions(): NormalizedPermission[] {
    return DEFAULT_APP_PERMISSIONS.reduce((acc, curr) => {
        return [...acc, ...curr.normalizePermission()];
    }, [] as NormalizedPermission[]);
}

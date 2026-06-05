import { Permission } from '@snippetly/common/dto';

interface AppPermissionPayload {
    /**
     * @description
     * Unique key identifying the permission.
     */
    key: string;
    /**
     * @description
     * Human-readable description of what the permission grants.
     */
    description?: string;
    /**
     * @description
     * Optional configuration for the permission behavior.
     */
    options?: {
        /**
         * @description
         * Whether this is an internal permission not exposed to users.
         */
        internal?: boolean;
        /**
         * @description
         * Whether this permission can be assigned to roles.
         */
        assignable?: boolean;
    };
}

export type NormalizedPermission = Required<
    Omit<AppPermissionPayload, 'options'> & Pick<AppPermissionPayload, 'options'>['options']
>;

/**
 * @description
 * Base class for defining application permissions.
 */
export class AppPermission {
    constructor(protected config: AppPermissionPayload) {}

    public normalizePermission(): NormalizedPermission[] {
        return [
            {
                key: this.config.key,
                description: this.config.description ?? `Grants permission on ${this.config.key} operations`,
                internal: this.config.options?.internal ?? false,
                assignable: this.config.options?.assignable ?? true,
            },
        ];
    }

    get permissionKey(): Permission {
        return this.config.key as Permission;
    }
}

/**
 * @description
 * Class for defining CRUD (Create, Read, Update, Delete) permissions.
 * Extends AppPermission to generate separate permissions for each operation.
 */
export class CrudPermission extends AppPermission {
    constructor(
        key: string,
        private descriptionFn?: (operation: 'create' | 'read' | 'update' | 'delete') => string,
    ) {
        super({ key });
    }

    public normalizePermission(): NormalizedPermission[] {
        return ['Create', 'Read', 'Update', 'Delete'].map(operation => ({
            key: `${operation}${this.config.key}`,
            description:
                typeof this.descriptionFn === 'function'
                    ? this.descriptionFn(
                          operation.toLocaleLowerCase() as 'create' | 'read' | 'update' | 'delete',
                      )
                    : `Grants permission to ${operation.toLocaleLowerCase()} ${this.config.key}`,
            assignable: true,
            internal: false,
        }));
    }

    get Create() {
        return `Create${this.config.key}` as Permission;
    }

    get Read() {
        return `Read${this.config.key}` as Permission;
    }

    get Update() {
        return `Update${this.config.key}` as Permission;
    }

    get Delete() {
        return `Delete${this.config.key}` as Permission;
    }
}

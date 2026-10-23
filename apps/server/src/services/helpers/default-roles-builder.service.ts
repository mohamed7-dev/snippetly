import { Permission } from '@snippetly/common/dto';
import {
    DEVELOPER_ROLE_DESCRIPTION,
    DEVELOPER_ROLE_NAME,
    SUPER_ADMIN_ROLE_DESCRIPTION,
    SUPER_ADMIN_ROLE_NAME,
} from '@snippetly/common/lib';
import { getNormalizedAppPermissions } from '../../api/permissions/default-permissions';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

export interface RoleDefinition {
    permissions: Permission[];
    description: string;
    name: string;
}

export type DefaultRolesMap = Map<string, RoleDefinition>;

@Injectable()
export class DefaultRolesBuilder {
    private defaultRolesDefinitions = new Map<string, RoleDefinition>();

    /**
     * @description
     * Builds and returns the platform's default role definitions.
     */
    public build(): DefaultRolesMap {
        this.defaultRolesDefinitions = new Map();

        this.buildPlatformRoles();

        return this.defaultRolesDefinitions;
    }

    /**
     * @description
     * Adds the built-in super-admin and developer roles to the definitions map.
     * @internal
     */
    private buildPlatformRoles(): void {
        this.defaultRolesDefinitions.set(SUPER_ADMIN_ROLE_NAME, {
            name: SUPER_ADMIN_ROLE_NAME,
            permissions: this.getAllAssignablePermissions(),
            description: SUPER_ADMIN_ROLE_DESCRIPTION,
        });

        this.defaultRolesDefinitions.set(DEVELOPER_ROLE_NAME, {
            name: DEVELOPER_ROLE_NAME,
            permissions: this.getDeveloperAssignablePermissions(),
            description: DEVELOPER_ROLE_DESCRIPTION,
        });
    }

    /**
     * @description
     * Returns all default role definitions as a list.
     */
    public getAllDefaultRolesFlattened(): RoleDefinition[] {
        return Array.from(this.defaultRolesDefinitions.values());
    }

    /**
     * @description
     * Returns the names of all default roles.
     */
    public getDefaultRolesName(): string[] {
        return this.getAllDefaultRolesFlattened().map(item => item.name);
    }

    /**
     * @description
     * Finds a default role definition by name.
     */
    public getDefaultRoleDefinitionByName(name: string): RoleDefinition | undefined {
        return this.getAllDefaultRolesFlattened().find(item => item.name === name);
    }

    /**
     * @description
     * Returns the default super-admin role definition.
     */
    public getSuperAdminRoleDefinition(): RoleDefinition | undefined {
        return this.getAllDefaultRolesFlattened().find(item => item.name === SUPER_ADMIN_ROLE_NAME);
    }

    /**
     * @description
     * Returns the default developer role definition.
     */
    public getDeveloperRoleDefinition(): RoleDefinition | undefined {
        return this.getAllDefaultRolesFlattened().find(item => item.name === DEVELOPER_ROLE_NAME);
    }

    /**
     * @description
     * Returns all application permissions that can be assigned to a role.
     */
    public getAllAssignablePermissions(): Permission[] {
        const allPermissions = getNormalizedAppPermissions();
        return allPermissions.filter(p => p.assignable).map(p => p.key);
    }

    /**
     * @description
     * Returns the permissions assigned to the default developer role.
     * @internal
     */
    private getDeveloperAssignablePermissions(): Permission[] {
        return [
            Permission.Authenticated,
            Permission.CreateCollection,
            Permission.DeleteCollection,
            Permission.UpdateCollection,
            Permission.ReadCollection,
            Permission.CreateSnippet,
            Permission.UpdateSnippet,
            Permission.DeleteSnippet,
            Permission.ReadSnippet,
            Permission.ReadTag,
            Permission.CreateFriendship,
            Permission.UpdateFriendship,
            Permission.ReadFriendship,
            Permission.DeleteFriendship,
            Permission.ReadDeveloper,
            Permission.UpdateDeveloper,
            Permission.DeleteDeveloper,
            Permission.ReadFavourite,
            Permission.CreateFavourite,
            Permission.DeleteFavourite,
            Permission.UpdateFavourite,
            Permission.ReadSession,
            Permission.DeleteSession,
            Permission.CreatePushNotification,
            Permission.ReadPushNotification,
            Permission.DeletePushNotification,
            Permission.ReadNotification,
            Permission.DeleteNotification,
            Permission.ReadDeveloperPreference,
            Permission.UpdateDeveloperPreference,
        ];
    }
}

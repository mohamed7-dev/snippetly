import { Permission } from '@snippetly/common/dto';
import {
    DEVELOPER_ROLE_DESCRIPTION,
    DEVELOPER_ROLE_NAME,
    SUPER_ADMIN_ROLE_DESCRIPTION,
    SUPER_ADMIN_ROLE_NAME,
} from '@snippetly/common/lib';
import { getNormalizedAppPermissions } from '../../api';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

interface RoleDefinition {
    permissions: Permission[];
    description: string;
    name: string;
}

export type DefaultRolesMap = Map<string, RoleDefinition>;

@Injectable()
export class DefaultRolesBuilder {
    private defaultRolesDefinitions = new Map<string, RoleDefinition>();

    public build(): DefaultRolesMap {
        this.defaultRolesDefinitions = new Map();

        this.buildPlatformRoles();

        return this.defaultRolesDefinitions;
    }

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

    public getAllDefaultRolesFlattened(): RoleDefinition[] {
        return Array.from(this.defaultRolesDefinitions.values());
    }

    public getDefaultRolesName(): string[] {
        return this.getAllDefaultRolesFlattened().map(item => item.name);
    }

    public getDefaultRoleDefinitionByName(name: string): RoleDefinition | undefined {
        return this.getAllDefaultRolesFlattened().find(item => item.name === name);
    }

    public getSuperAdminRoleDefinition(): RoleDefinition | undefined {
        return this.getAllDefaultRolesFlattened().find(item => item.name === SUPER_ADMIN_ROLE_NAME);
    }

    public getDeveloperRoleDefinition(): RoleDefinition | undefined {
        return this.getAllDefaultRolesFlattened().find(item => item.name === DEVELOPER_ROLE_NAME);
    }

    private getAllAssignablePermissions(): Permission[] {
        const allPermissions = getNormalizedAppPermissions();
        return allPermissions.filter(p => p.assignable).map(p => p.key);
    }

    private getDeveloperAssignablePermissions(): Permission[] {
        return [
            Permission.Authenticated,
            Permission.CreateCollection,
            Permission.DeleteCollection,
            Permission.UpdateCollection,
            Permission.ReadCollection,
            Permission.ForkCollection,
            Permission.CreateSnippet,
            Permission.UpdateSnippet,
            Permission.DeleteSnippet,
            Permission.ReadSnippet,
            Permission.ForkSnippet,
            Permission.ReadTag,
            Permission.CreateFriendship,
            Permission.UpdateFriendship,
            Permission.ReadFriendship,
            Permission.DeleteFriendship,
            Permission.ReadDeveloper,
            Permission.UpdateDeveloper,
            Permission.DeleteDeveloper,
        ];
    }
}

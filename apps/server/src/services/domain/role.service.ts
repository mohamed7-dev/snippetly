import {
    DEVELOPER_ROLE_DESCRIPTION,
    DEVELOPER_ROLE_NAME,
    SUPER_ADMIN_ROLE_DESCRIPTION,
    SUPER_ADMIN_ROLE_NAME,
} from '@snippetly/common/lib';
import { RequestContext } from '../../api/request-context/request-context';
import { InternalServerError } from '../../common/errors/errors';
import { unique } from '../../common/helpers/unique';
import { Role } from '../../entities/role/role.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { DefaultRolesBuilder } from '../helpers/default-roles-builder.service';

@Injectable()
export class RoleService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly defaultRolesBuilder: DefaultRolesBuilder,
    ) {}

    public async initializeRoles() {
        await this.initSuperAdminRole();
        await this.initDeveloperRole();
    }

    public async getSuperAdminRole(ctx?: RequestContext) {
        const superAdminRole = await this.databaseService.getRepository(ctx, Role).findOne({
            where: { name: SUPER_ADMIN_ROLE_NAME },
        });
        if (!superAdminRole) throw new InternalServerError('errors.super_admin_role_not_found');
        return superAdminRole;
    }

    public async getDeveloperRole(ctx?: RequestContext) {
        const developerRole = await this.databaseService.getRepository(ctx, Role).findOne({
            where: { name: DEVELOPER_ROLE_NAME },
        });
        if (!developerRole) throw new InternalServerError('errors.developer_role_not_found');
        return developerRole;
    }

    public async initSuperAdminRole() {
        const roleDef = this.defaultRolesBuilder.getSuperAdminRoleDefinition();
        if (!roleDef) {
            throw new InternalServerError('errors.super_admin_role_definition_not_defined');
        }

        try {
            const superAdminRole = await this.getSuperAdminRole();
            superAdminRole.permissions = unique(roleDef.permissions);
            await this.databaseService.getRepository(Role).save(superAdminRole, { reload: false });
        } catch {
            const role = new Role({
                name: SUPER_ADMIN_ROLE_NAME,
                description: SUPER_ADMIN_ROLE_DESCRIPTION,
                permissions: unique(roleDef.permissions),
            });
            await this.databaseService.getRepository(Role).save(role);
        }
    }

    private async initDeveloperRole() {
        try {
            await this.getDeveloperRole();
        } catch {
            const roleDef = this.defaultRolesBuilder.getDeveloperRoleDefinition();
            if (!roleDef) {
                throw new InternalServerError('errors.developer_role_definition_not_defined');
            }
            const role = new Role({
                name: DEVELOPER_ROLE_NAME,
                description: DEVELOPER_ROLE_DESCRIPTION,
                permissions: unique(roleDef.permissions),
            });
            await this.databaseService.getRepository(Role).save(role);
        }
    }
}

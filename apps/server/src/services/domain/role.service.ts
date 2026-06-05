import { Permission } from '@snippetly/common/dto';
import { InternalServerError } from '@snippetly/common/errors';
import {
    DEVELOPER_ROLE_DESCRIPTION,
    DEVELOPER_ROLE_NAME,
    SUPER_ADMIN_ROLE_DESCRIPTION,
    SUPER_ADMIN_ROLE_NAME,
} from '@snippetly/common/lib';
import { getNormalizedAppPermissions } from '../../api';
import { RequestContext } from '../../api/request-context/request-context';
import { unique } from '../../common/helpers/unique';
import { Role } from '../../entities/role/role.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

@Injectable()
export class RoleService {
    constructor(private readonly databaseService: DatabaseService) {}

    public async initializeRoles() {
        await this.initSuperAdminRole();
        await this.initDeveloperRole();
    }

    public async getSuperAdminRole(ctx?: RequestContext) {
        const superAdminRole = await this.databaseService.getRepository(ctx, Role).findOne({
            where: { name: SUPER_ADMIN_ROLE_NAME },
        });
        if (!superAdminRole) throw new InternalServerError('errors.super-admin-role-not-found');
        return superAdminRole;
    }

    public async getDeveloperRole(ctx?: RequestContext) {
        const studentRole = await this.databaseService.getRepository(ctx, Role).findOne({
            where: { name: DEVELOPER_ROLE_NAME },
        });
        if (!studentRole) throw new InternalServerError('errors.developer-role-not-found');
        return studentRole;
    }

    public async initSuperAdminRole() {
        const allAssignablePermissions = this.getAllAssignablePermissions();

        try {
            const superAdminRole = await this.getSuperAdminRole();
            superAdminRole.permissions = allAssignablePermissions;
            await this.databaseService.getRepository(Role).save(superAdminRole, { reload: false });
        } catch {
            const role = new Role({
                name: SUPER_ADMIN_ROLE_NAME,
                description: SUPER_ADMIN_ROLE_DESCRIPTION,
                permissions: unique([Permission.Authenticated, ...allAssignablePermissions]),
            });
            await this.databaseService.getRepository(Role).save(role);
        }
    }

    private async initDeveloperRole() {
        try {
            await this.getDeveloperRole();
        } catch {
            const role = new Role({
                name: DEVELOPER_ROLE_NAME,
                description: DEVELOPER_ROLE_DESCRIPTION,
                permissions: unique([Permission.Authenticated]),
            });
            await this.databaseService.getRepository(Role).save(role);
        }
    }

    private getAllAssignablePermissions(): Permission[] {
        return getNormalizedAppPermissions()
            .filter(p => p.assignable)
            .map(p => p.key as Permission);
    }
}

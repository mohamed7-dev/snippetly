import { Permission } from '@snippetly/common/dto';
import {
    DEVELOPER_ROLE_DESCRIPTION,
    DEVELOPER_ROLE_NAME,
    SUPER_ADMIN_ROLE_DESCRIPTION,
    SUPER_ADMIN_ROLE_NAME,
} from '@snippetly/common/lib';
import { RequestContext } from '../../api/request-context/request-context';
import { InternalServerError, UserInputError } from '../../common/errors/errors';
import { unique } from '../../common/helpers/unique';
import { Role } from '../../entities/role/role.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { RoleEvent } from '../../infra/event-bus/events/role.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { DefaultRolesBuilder, RoleDefinition } from '../helpers/default-roles-builder.service';

// when admin api is implemented, this input type should be coming from the dto
type CreateRoleInput = RoleDefinition;

@Injectable()
export class RoleService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly defaultRolesBuilder: DefaultRolesBuilder,
        private readonly eventBus: EventBus,
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

    public async create(ctx: RequestContext, input: CreateRoleInput) {
        this.checkPermissionsAreValid(input.permissions);
        this.checkCurrentUserHasSufficientPermissions(ctx, input.permissions);
        const role = new Role({
            name: input.name,
            description: input.description,
            permissions: unique([Permission.Authenticated, ...input.permissions]),
        });

        await this.databaseService.getRepository(ctx, Role).save(role);

        await this.eventBus.publish(new RoleEvent(ctx, role, 'created', input));

        return role;
    }

    private checkCurrentUserHasSufficientPermissions(ctx: RequestContext, permissions: Permission[]) {
        const hasAllPermissions = ctx.checkIfUserHasAllPermissions(permissions);
        if (!hasAllPermissions) {
            throw new UserInputError('errors.current_user_does_not_have_sufficient_permissions');
        }
    }

    private checkPermissionsAreValid(permissions?: Permission[] | null) {
        if (!permissions) return;

        const possiblePermissions = this.defaultRolesBuilder.getAllAssignablePermissions();
        for (const permission of permissions) {
            if (!possiblePermissions.includes(permission) || permission === Permission.SuperAdmin) {
                throw new UserInputError('errors.permission_invalid', { permission });
            }
        }
    }

    private async initSuperAdminRole() {
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

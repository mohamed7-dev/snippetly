import { IsNull } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { ConfigService } from '../../config';
import { Administrator } from '../../entities/administrator/administrator.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { RequestContextService } from '../helpers/request-context.service';
import { RoleService } from './role.service';
import { UserService } from './user.service';

@Injectable()
export class AdministratorService {
    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DatabaseService,
        private readonly roleService: RoleService,
        private readonly userService: UserService,
        private readonly requestContextService: RequestContextService,
    ) {}

    public async initializeAdministrators() {
        const { superAdminCredentials } = this.configService.authOptions;
        const superAdminUser = await this.databaseService.getRepository(User).findOne({
            where: {
                identifier: superAdminCredentials.identifier,
            },
        });

        if (superAdminUser) {
            const admin = await this.databaseService.getRepository(Administrator).findOne({
                where: {
                    user: {
                        id: superAdminUser.id,
                    },
                },
            });
            if (!admin) {
                const administrator = new Administrator({
                    username: superAdminCredentials.identifier,
                    firstName: 'Super',
                    lastName: 'Admin',
                    user: superAdminUser,
                });
                await this.databaseService.getRepository(Administrator).save(administrator);
            } else if (admin.deletedAt !== null) {
                admin.deletedAt = null;
                await this.databaseService.getRepository(Administrator).save(admin);
            }
            if (superAdminUser.deletedAt != null) {
                superAdminUser.deletedAt = null;
                await this.databaseService.getRepository(User).save(superAdminUser);
            }
        } else {
            const superAdminRole = await this.roleService.getSuperAdminRole();
            const administrator = new Administrator({
                username: superAdminCredentials.identifier,
                firstName: 'Super',
                lastName: 'Admin',
            });
            const ctx = await this.requestContextService.create({
                apiType: 'admin',
            });
            administrator.user = await this.userService.createAdminUser(ctx, {
                identifier: superAdminCredentials.identifier,
                plainPassword: superAdminCredentials.password,
            });
            const { id } = await this.databaseService.getRepository(Administrator).save(administrator);
            const createdAdministrator = (await this.findOneById(ctx, id)) as Administrator;
            createdAdministrator?.user.roles.push(superAdminRole);
            await this.databaseService
                .getRepository(User)
                .save(createdAdministrator?.user, { reload: false });
        }
    }

    public async findOneById(ctx: RequestContext, id: string): Promise<Administrator | undefined> {
        return await this.databaseService
            .getRepository(ctx, Administrator)
            .findOne({
                relations: { user: { roles: true } },
                where: {
                    id,
                    deletedAt: IsNull(),
                },
            })
            .then(result => result ?? undefined);
    }

    public async findOneByUserId(
        ctx: RequestContext,
        userId: string,
        relations?: any,
    ): Promise<Administrator | undefined> {
        return (
            (await this.databaseService.getRepository(ctx, Administrator).findOne({
                relations: { user: { roles: true } },
                where: {
                    user: { id: userId },
                    deletedAt: IsNull(),
                },
            })) ?? undefined
        );
    }
}

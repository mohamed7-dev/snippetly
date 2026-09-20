import { RequestContext } from '../../api/request-context/request-context';
import { UnverifiedExternalEmailError } from '../../common/errors/errors';
import { ExternalAuthenticationMethod } from '../../entities/authentication-method/authentication-method.entity';
import { Developer } from '../../entities/developer/developer.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { DeveloperService } from '../domain/developer.service';
import { RoleService } from '../domain/role.service';

@Injectable()
export class ExternalAuthService {
    constructor(
        private readonly roleService: RoleService,
        private readonly databaseService: DatabaseService,
        private readonly developerService: DeveloperService,
    ) {}

    public async createUserAndDeveloper(
        ctx: RequestContext,
        input: {
            emailAddress: string;
            firstName: string;
            lastName: string;
            isVerified?: boolean;
            strategyName: string;
            identifier: string;
        },
    ) {
        let user: User;

        const foundUser = await this.findUserByEmail(ctx, input.emailAddress);

        if (foundUser) {
            if (!input.isVerified) {
                throw new UnverifiedExternalEmailError();
            }
            user = foundUser;
        } else {
            const developerRole = await this.roleService.getDeveloperRole(ctx);
            user = new User({
                identifier: input.emailAddress,
                roles: [developerRole],
                isVerified: input.isVerified || false,
                authenticationMethods: [],
            });
        }

        const authMethod = await this.databaseService.getRepository(ctx, ExternalAuthenticationMethod).save(
            new ExternalAuthenticationMethod({
                identifier: input.identifier,
                provider: input.strategyName,
            }),
        );

        user.authenticationMethods = [...(user.authenticationMethods || []), authMethod];
        const savedUser = await this.databaseService.getRepository(ctx, User).save(user);

        let developer: Developer;
        const foundDeveloper = await this.developerService.getOneByUserId(ctx, savedUser.id);
        if (foundDeveloper) {
            developer = foundDeveloper;
        } else {
            developer = new Developer({
                emailAddress: input.emailAddress,
                firstName: input.firstName,
                lastName: input.lastName,
                user: savedUser,
            });
        }
        await this.databaseService.getRepository(ctx, Developer).save(developer);
        return savedUser;
    }
    public async findDeveloperUser(
        ctx: RequestContext,
        strategyName: string,
        identifier: string,
    ): Promise<User | undefined> {
        const user = await this.findUser(ctx, strategyName, identifier);

        if (user) {
            const customer = await this.developerService.getOneByUserId(ctx, user.id);
            if (customer) return user;
        }
    }

    private async findUser(
        ctx: RequestContext,
        strategyName: string,
        identifier: string,
    ): Promise<User | undefined> {
        const user = await this.databaseService
            .getRepository(ctx, User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.authenticationMethods', 'aums')
            .leftJoin('user.authenticationMethods', 'authMethod')
            .andWhere('authMethod.identifier = :identifier', { identifier })
            .andWhere('authMethod.provider = :strategyName', { strategyName })
            .andWhere('user.deletedAt IS NULL')
            .getOne();

        return user || undefined;
    }

    private async findUserByEmail(ctx: RequestContext, emailAddress: string) {
        const developer = await this.databaseService
            .getRepository(ctx, Developer)
            .createQueryBuilder('developer')
            .leftJoinAndSelect('developer.user', 'user')
            .leftJoinAndSelect('user.authenticationMethods', 'authMethod')
            .andWhere('developer.emailAddress = :emailAddress', { emailAddress })
            .andWhere('user.deletedAt IS NULL')
            .getOne();

        return developer?.user;
    }
}

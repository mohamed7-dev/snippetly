import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { SoftDeletable } from '../../common/types/soft-deletable.interface';
import { AppEntity } from '../../infra/database/app-entity';
import {
    AuthenticationMethod,
    CredentialsAuthenticationMethod,
} from '../authentication-method/authentication-method.entity';
import { Role } from '../role/role.entity';
import { Session } from '../session/session.entity';

@Entity()
export class User extends AppEntity implements SoftDeletable {
    constructor(input?: DeepPartial<User>) {
        super(input);
    }

    @Column({ nullable: true, type: 'date' })
    deletedAt: Date | null;

    @Column()
    identifier: string;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ nullable: true, type: 'date' })
    lastAuthenticatedAt: Date | null;

    @OneToMany(() => AuthenticationMethod, authenticationMethods => authenticationMethods.user)
    authenticationMethods: AuthenticationMethod[];

    @OneToMany(() => Session, sessions => sessions.user)
    sessions: Session[];

    @ManyToMany(() => Role)
    @JoinTable()
    roles: Role[];

    public getCredentialsAuthMethod(): CredentialsAuthenticationMethod;
    public getCredentialsAuthMethod(options?: {
        throwError?: boolean;
    }): CredentialsAuthenticationMethod | undefined;
    public getCredentialsAuthMethod(options?: {
        throwError?: boolean;
    }): CredentialsAuthenticationMethod | undefined {
        if (!this.authenticationMethods) {
            // throw new InternalServerError('User authentication methods are not loaded');
            throw new Error('errors.authentication_methods_not_loaded');
        }
        const match = this.authenticationMethods.find(
            (m): m is CredentialsAuthenticationMethod => m instanceof CredentialsAuthenticationMethod,
        );
        if (!match && options?.throwError) {
            // throw new InternalServerError('Credentials authentication method not found');
            throw new Error('errors.credentials_authentication_method_not_found');
        }
        return match;
    }
}

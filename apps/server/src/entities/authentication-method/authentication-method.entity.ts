import { DeepPartial } from '@snippetly/common/lib';
import { ChildEntity, Column, Entity, Index, ManyToOne, TableInheritance } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { User } from '../users/user.entity';

@TableInheritance({ column: { name: 'type', type: 'varchar' } })
@Entity()
export abstract class AuthenticationMethod extends AppEntity {
    @Index()
    @ManyToOne(() => User, user => user.authenticationMethods)
    user: User;
}

@ChildEntity()
export class CredentialsAuthenticationMethod extends AuthenticationMethod {
    constructor(input?: DeepPartial<CredentialsAuthenticationMethod>) {
        super(input);
    }

    @Column()
    identifier: string;

    @Column({ select: false })
    password: string;

    @Column({ default: null, nullable: true, type: 'varchar' })
    verificationToken: string | null;

    @Column({ default: null, nullable: true, type: 'varchar' })
    passwordResetToken: string | null;

    @Column({ default: null, nullable: true, type: 'varchar' })
    identifierChangeToken: string | null;

    @Column({ default: null, nullable: true, type: 'varchar' })
    identifierPlaceholder: string | null;
}

@ChildEntity()
export class ExternalAuthenticationMethod extends AuthenticationMethod {
    constructor(input?: DeepPartial<CredentialsAuthenticationMethod>) {
        super(input);
    }

    /**
     * The name of the external authentication provider (e.g., 'google', 'facebook', 'github').
     */
    @Column()
    provider: string;

    /**
     * The user's identifier within the external provider's system.
     * This is typically the unique ID assigned by the provider.
     */
    @Column()
    identifier: string;

    /**
     * Provider-specific metadata stored as JSON.
     * Contains additional information from the external provider
     * such as profile data, tokens, or other provider-specific fields.
     */
    @Column({ type: 'simple-json' })
    metadata: any;
}

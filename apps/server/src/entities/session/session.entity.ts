import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { User } from '../users/user.entity';

@Entity()
export class Session extends AppEntity {
    constructor(input?: DeepPartial<Session>) {
        super(input);
    }

    @Column()
    token: string;

    @Column()
    expiresAt: Date;

    @Column()
    invalidated: boolean;

    /**
     * @description
     * The authentication strategy used to create this session (e.g., 'credentials', 'oauth', 'saml').
     */
    @Column()
    authenticationStrategy: string;

    @Column({ type: 'text', nullable: true })
    userAgent: string | null;

    @Index()
    @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
    user: User;
}

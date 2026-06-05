import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SoftDeletable } from '../../common/types/soft-deletable.interface';
import { AppEntity } from '../../infra/database/app-entity';
import { User } from '../users/user.entity';

@Entity()
export class Administrator extends AppEntity implements SoftDeletable {
    constructor(input?: DeepPartial<Administrator>) {
        super(input);
    }

    @Column({ type: 'date', nullable: true })
    deletedAt: Date | null;

    @Column()
    username: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;
}

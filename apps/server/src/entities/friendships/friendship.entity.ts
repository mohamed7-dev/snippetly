import { FriendshipStatus } from '@snippetly/common/dto';
import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { Developer } from '../developer/developer.entity';

@Entity()
@Index('friendship_requester_addressee_unique', ['requester', 'addressee'], { unique: true })
export class Friendship extends AppEntity {
    constructor(input?: DeepPartial<Friendship>) {
        super(input);
    }

    @ManyToOne(() => Developer, user => user.friendshipsRequested, { onDelete: 'CASCADE' })
    requester: Developer;

    @ManyToOne(() => Developer, user => user.friendshipsReceived, { onDelete: 'CASCADE' })
    addressee: Developer;

    @Column()
    status: FriendshipStatus;

    @Column({ type: 'date', nullable: true })
    acceptedAt: Date | null;

    @Column({ type: 'date', nullable: true })
    rejectedAt: Date | null;

    @Column({ type: 'date', nullable: true })
    cancelledAt: Date | null;
}

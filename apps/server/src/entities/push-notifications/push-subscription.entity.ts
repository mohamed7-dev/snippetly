import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { Developer } from '../developer/developer.entity';

@Entity()
@Index('push_subscription_endpoint_unique', ['endpoint'], { unique: true })
export class PushSubscription extends AppEntity {
    constructor(input?: DeepPartial<PushSubscription>) {
        super(input);
    }

    @Column({ type: 'text' })
    endpoint: string;

    @Column({ type: 'text' })
    p256dh: string;

    @Column({ type: 'text' })
    auth: string;

    @Column({ type: 'text', nullable: true })
    userAgent: string | null;

    @ManyToOne(() => Developer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'developerId' })
    developer: Developer;
}

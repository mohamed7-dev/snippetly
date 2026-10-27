import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { Developer } from '../developer/developer.entity';

@Entity()
@Index('app_notification_developer_tag_unique', ['developer', 'tag'], { unique: true })
export class AppNotification extends AppEntity {
    constructor(input?: DeepPartial<AppNotification>) {
        super(input);
    }

    @ManyToOne(() => Developer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'developerId' })
    developer: Developer;

    @Column()
    title: string;

    @Column({ type: 'text' })
    body: string;

    @Column({ type: 'text', nullable: true })
    url: string | null;

    @Column({ type: 'varchar', nullable: true })
    tag: string | null;

    @Column({ type: 'date', nullable: true })
    dismissedAt: Date | null;
}

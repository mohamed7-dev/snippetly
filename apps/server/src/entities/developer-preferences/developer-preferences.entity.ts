import type { GetDeveloperPreferencesDtoType } from '@snippetly/common/dto';
import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { Developer } from '../developer/developer.entity';

export type DeveloperPreferenceValues = GetDeveloperPreferencesDtoType['output']['preferences'];

@Entity()
export class DeveloperPreferences extends AppEntity {
    constructor(input?: DeepPartial<DeveloperPreferences>) {
        super(input);
    }

    @OneToOne(() => Developer, { onDelete: 'CASCADE' })
    @JoinColumn()
    developer: Developer;

    @Column({ type: 'simple-json' })
    preferences: DeveloperPreferenceValues;
}

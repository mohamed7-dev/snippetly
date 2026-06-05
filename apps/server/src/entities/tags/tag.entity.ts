import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, Index, ManyToMany, ManyToOne } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { Collection } from '../collections/collection.entity';
import { Developer } from '../developer/developer.entity';
import { Snippet } from '../snippets/snippet.entity';

@Entity()
export class Tag extends AppEntity {
    constructor(input?: DeepPartial<Tag>) {
        super(input);
    }

    @Index({ unique: true })
    @Column()
    name: string;

    @Column({ default: 0 })
    usageCount: number;

    @ManyToOne(() => Developer, user => user.addedTags, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    addedBy: Developer | null;

    @ManyToMany(() => Collection, collection => collection.tags)
    collections: Collection[];

    @ManyToMany(() => Snippet, snippet => snippet.tags)
    snippets: Snippet[];
}

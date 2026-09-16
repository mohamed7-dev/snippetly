import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { Collection } from '../collections/collection.entity';
import { Developer } from '../developer/developer.entity';
import { Tag } from '../tags/tag.entity';

@Entity()
export class Snippet extends AppEntity {
    constructor(input?: DeepPartial<Snippet>) {
        super(input);
    }

    @Column()
    name: string;

    @Index({ unique: true })
    @Column()
    slug: string;

    @Column('text')
    code: string;

    @Column()
    language: string;

    @Column({ nullable: true, default: null })
    description?: string;

    @Column({ nullable: true, default: null })
    note?: string;

    @Column({ default: false })
    isPrivate: boolean;

    @Column({ default: true })
    allowForking: boolean;

    @Index()
    @ManyToOne(() => Snippet, snippet => snippet.forkedChildren, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    forkedFrom: Snippet | null;

    @OneToMany(() => Snippet, snippet => snippet.forkedFrom)
    forkedChildren: Snippet[];

    @Index()
    @ManyToOne(() => Developer, creator => creator.snippets, { onDelete: 'CASCADE' })
    creator: Developer;

    @Index()
    @ManyToOne(() => Collection, collection => collection.snippets, { onDelete: 'CASCADE' })
    collection: Collection;

    @ManyToMany(() => Tag, tag => tag.snippets)
    @JoinTable()
    tags: Tag[];
}

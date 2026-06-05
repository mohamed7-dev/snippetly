import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
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
    title: string;

    @Index({ unique: true })
    @Column()
    slug: string;

    @Column('text')
    code: string;

    @Column()
    language: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    note?: string;

    @Column({ default: false })
    isPrivate: boolean;

    @Column({ default: true })
    allowForking: boolean;

    @ManyToOne(() => Snippet, snippet => snippet.forkedChildren, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'forked_from' })
    forkedFrom: Snippet | null;

    @ManyToOne(() => Developer, creator => creator.snippets, { onDelete: 'CASCADE' })
    creator: Developer;

    @ManyToOne(() => Collection, collection => collection.snippets, { onDelete: 'CASCADE' })
    collection: Collection;

    @OneToMany(() => Snippet, snippet => snippet.forkedFrom)
    forkedChildren: Snippet[];

    @ManyToMany(() => Tag, tag => tag.snippets)
    @JoinTable()
    tags: Tag[];
}

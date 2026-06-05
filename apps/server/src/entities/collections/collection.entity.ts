import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { Developer } from '../developer/developer.entity';
import { Snippet } from '../snippets/snippet.entity';
import { Tag } from '../tags/tag.entity';

@Entity()
export class Collection extends AppEntity {
    constructor(input?: DeepPartial<Collection>) {
        super(input);
    }

    @Column()
    title: string;

    @Index({ unique: true })
    @Column()
    slug: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    color: string;

    @Column({ default: false })
    isPrivate: boolean;

    @Column({ default: true })
    allowForking: boolean;

    @ManyToOne(() => Collection, collection => collection.forkedChildren, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'forked_from' })
    forkedFrom: Collection | null;

    @ManyToOne(() => Developer, creator => creator.collections, { onDelete: 'CASCADE' })
    creator: Developer;

    @OneToMany(() => Collection, collection => collection.forkedFrom)
    forkedChildren: Collection[];

    @OneToMany(() => Snippet, snippet => snippet.collection)
    snippets: Snippet[];

    @ManyToMany(() => Tag, tag => tag.collections)
    @JoinTable()
    tags: Tag[];
}

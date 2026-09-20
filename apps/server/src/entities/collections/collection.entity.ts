import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { SoftDeletable } from '../../common/types/soft-deletable.interface';
import { AppEntity } from '../../infra/database/app-entity';
import { Developer } from '../developer/developer.entity';
import { Snippet } from '../snippets/snippet.entity';
import { Tag } from '../tags/tag.entity';

@Entity()
export class Collection extends AppEntity implements SoftDeletable {
    constructor(input?: DeepPartial<Collection>) {
        super(input);
    }

    @Column({ nullable: true, type: 'date' })
    deletedAt: Date | null;

    @Column()
    name: string;

    @Index({ unique: true })
    @Column()
    slug: string;

    @Column({ nullable: true, default: null })
    description?: string;

    @Column()
    color: string;

    @Column({ default: false })
    isPrivate: boolean;

    @Column({ default: true })
    allowForking: boolean;

    @Index()
    @ManyToOne(() => Developer, creator => creator.collections, { onDelete: 'CASCADE' })
    creator: Developer;

    @ManyToOne(() => Collection, collection => collection.forkedChildren, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'forked_from' })
    forkedFrom: Collection | null;

    @OneToMany(() => Collection, collection => collection.forkedFrom)
    forkedChildren: Collection[];

    @OneToMany(() => Snippet, snippet => snippet.collection)
    snippets: Snippet[];

    @ManyToMany(() => Tag, tag => tag.collections)
    @JoinTable()
    tags: Tag[];
}

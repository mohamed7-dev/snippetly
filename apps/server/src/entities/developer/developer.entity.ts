import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { SoftDeletable } from '../../common/types/soft-deletable.interface';
import { AppEntity } from '../../infra/database/app-entity';
import { Collection } from '../collections/collection.entity';
import { Friendship } from '../friendships/friendship.entity';
import { Snippet } from '../snippets/snippet.entity';
import { Tag } from '../tags/tag.entity';
import { User } from '../users/user.entity';

@Entity()
export class Developer extends AppEntity implements SoftDeletable {
    constructor(input?: DeepPartial<Developer>) {
        super(input);
    }

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @Column({ nullable: true, type: 'date' })
    deletedAt: Date | null;

    @Column()
    emailAddress: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    bio?: string;

    @Column({ nullable: true })
    image?: string;

    @Column({ nullable: true })
    imageKey?: string;

    @Column({ default: false })
    isPrivate: boolean;

    @OneToMany(() => Collection, collection => collection.creator)
    collections: Collection[];

    @OneToMany(() => Snippet, snippet => snippet.creator)
    snippets: Snippet[];

    @OneToMany(() => Tag, tag => tag.addedBy)
    addedTags: Tag[];

    @OneToMany(() => Friendship, friendship => friendship.requester)
    friendshipsRequested: Friendship[];

    @OneToMany(() => Friendship, friendship => friendship.addressee)
    friendshipsReceived: Friendship[];
}

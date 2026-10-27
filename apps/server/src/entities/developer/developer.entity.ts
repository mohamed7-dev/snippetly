import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { SoftDeletable } from '../../common/types/soft-deletable.interface';
import { AppEntity } from '../../infra/database/app-entity';
import { Collection } from '../collections/collection.entity';
import { Favourite } from '../favourites/favourite.entity';
import { Friendship } from '../friendships/friendship.entity';
import { Snippet } from '../snippets/snippet.entity';
import { Tag } from '../tags/tag.entity';
import { User } from '../users/user.entity';

@Entity()
export class Developer extends AppEntity implements SoftDeletable {
    constructor(input?: DeepPartial<Developer>) {
        super(input);
    }

    @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    get isVerified(): boolean {
        return this.user.isVerified;
    }

    @Column({ nullable: true, type: 'date' })
    deletedAt: Date | null;

    @Column({ nullable: true, type: 'date' })
    scheduledDeletionAt: Date | null;

    @Column()
    emailAddress: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true, default: null })
    bio?: string;

    @Column({ nullable: true, default: null })
    image?: string;

    @Column({ nullable: true, default: null })
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

    @OneToMany(() => Favourite, favourite => favourite.developer)
    favourites: Favourite[];

    @OneToMany(() => Favourite, favourite => favourite.favoritedDeveloper)
    favouritedBy: Favourite[];
}

import { DeepPartial } from '@snippetly/common/lib';
import { Check, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';
import { Collection } from '../collections/collection.entity';
import { Developer } from '../developer/developer.entity';
import { Snippet } from '../snippets/snippet.entity';

@Entity()
@Check(
    'favourite_single_target',
    '(("snippetId" IS NOT NULL AND "collectionId" IS NULL AND "favoritedDeveloperId" IS NULL) OR ("snippetId" IS NULL AND "collectionId" IS NOT NULL AND "favoritedDeveloperId" IS NULL) OR ("snippetId" IS NULL AND "collectionId" IS NULL AND "favoritedDeveloperId" IS NOT NULL))',
)
@Index('favourite_developer_snippet_unique', ['developer', 'snippet'], { unique: true })
@Index('favourite_developer_collection_unique', ['developer', 'collection'], { unique: true })
@Index('favourite_developer_favorited_developer_unique', ['developer', 'favoritedDeveloper'], {
    unique: true,
})
export class Favourite extends AppEntity {
    constructor(input?: DeepPartial<Favourite>) {
        super(input);
    }

    @ManyToOne(() => Developer, developer => developer.favourites, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    developer: Developer;

    @ManyToOne(() => Snippet, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn()
    snippet: Snippet | null;

    @ManyToOne(() => Collection, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn()
    collection: Collection | null;

    @ManyToOne(() => Developer, developer => developer.favouritedBy, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    favoritedDeveloper: Developer | null;
}

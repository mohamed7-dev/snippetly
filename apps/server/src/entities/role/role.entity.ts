import { Permission } from '@snippetly/common/dto';
import { DeepPartial } from '@snippetly/common/lib';
import { Column, Entity } from 'typeorm';
import { AppEntity } from '../../infra/database/app-entity';

@Entity()
export class Role extends AppEntity {
    constructor(input?: DeepPartial<Role>) {
        super(input);
    }

    /**
     * @description
     * Unique name for the role. Must be unique across all roles.
     */
    @Column()
    name: string;

    /**
     * @description
     * Human-readable description of the role's purpose and responsibilities.
     */
    @Column()
    description: string;

    @Column('simple-array') permissions: Permission[];
}

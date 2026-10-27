import { DeepPartial } from '@snippetly/common/lib';
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class AppEntity {
    constructor(input?: DeepPartial<AppEntity>) {
        if (input) {
            Object.assign(this, input);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

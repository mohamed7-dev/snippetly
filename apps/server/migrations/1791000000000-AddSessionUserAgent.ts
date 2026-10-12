import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionUserAgent1791000000000 implements MigrationInterface {
    name = 'AddSessionUserAgent1791000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ADD "userAgent" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "userAgent"`);
    }
}

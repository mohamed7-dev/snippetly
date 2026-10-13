import { MigrationInterface, QueryRunner } from 'typeorm';

export class CascadeDeveloperAccountDelete1792000000000 implements MigrationInterface {
    name = 'CascadeDeveloperAccountDelete1792000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "developer" ADD "scheduledDeletionAt" TIMESTAMP`);
        await queryRunner.query(
            `ALTER TABLE "developer" DROP CONSTRAINT "FK_cc6fed0de92da43127fd5a5fb84"`,
        );
        await queryRunner.query(
            `ALTER TABLE "developer" ADD CONSTRAINT "FK_cc6fed0de92da43127fd5a5fb84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
        );
        await queryRunner.query(
            `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "authentication_method" DROP CONSTRAINT "FK_00cbe87bc0d4e36758d61bd31d6"`,
        );
        await queryRunner.query(
            `ALTER TABLE "authentication_method" ADD CONSTRAINT "FK_00cbe87bc0d4e36758d61bd31d6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(`ALTER TABLE "administrator" DROP CONSTRAINT "FK_1966e18ce6a39a82b19204704d7"`);
        await queryRunner.query(
            `ALTER TABLE "administrator" ADD CONSTRAINT "FK_1966e18ce6a39a82b19204704d7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "administrator" DROP CONSTRAINT "FK_1966e18ce6a39a82b19204704d7"`);
        await queryRunner.query(
            `ALTER TABLE "administrator" ADD CONSTRAINT "FK_1966e18ce6a39a82b19204704d7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "authentication_method" DROP CONSTRAINT "FK_00cbe87bc0d4e36758d61bd31d6"`,
        );
        await queryRunner.query(
            `ALTER TABLE "authentication_method" ADD CONSTRAINT "FK_00cbe87bc0d4e36758d61bd31d6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
        );
        await queryRunner.query(
            `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "developer" DROP CONSTRAINT "FK_cc6fed0de92da43127fd5a5fb84"`,
        );
        await queryRunner.query(
            `ALTER TABLE "developer" ADD CONSTRAINT "FK_cc6fed0de92da43127fd5a5fb84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(`ALTER TABLE "developer" DROP COLUMN "scheduledDeletionAt"`);
    }
}

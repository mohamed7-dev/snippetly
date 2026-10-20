import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPushSubscriptions1794000000000 implements MigrationInterface {
    name = 'AddPushSubscriptions1794000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "push_subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "endpoint" text NOT NULL, "p256dh" text NOT NULL, "auth" text NOT NULL, "userAgent" text, "developerId" uuid NOT NULL, CONSTRAINT "PK_push_subscription" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "push_subscription_endpoint_unique" ON "push_subscription" ("endpoint")`,
        );
        await queryRunner.query(
            `ALTER TABLE "push_subscription" ADD CONSTRAINT "FK_push_subscription_developer" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "push_subscription" DROP CONSTRAINT "FK_push_subscription_developer"`,
        );
        await queryRunner.query(`DROP TABLE "push_subscription"`);
    }
}

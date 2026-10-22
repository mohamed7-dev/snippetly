import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeveloperPreferencesAndAppNotifications1795000000000 implements MigrationInterface {
    name = 'AddDeveloperPreferencesAndAppNotifications1795000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "developer_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "preferences" text NOT NULL, "developerId" uuid NOT NULL, CONSTRAINT "REL_developer_preferences_developer" UNIQUE ("developerId"), CONSTRAINT "PK_developer_preferences" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "developer_preferences" ADD CONSTRAINT "FK_developer_preferences_developer" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `CREATE TABLE "app_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "body" text NOT NULL, "url" text, "tag" character varying, "dismissedAt" TIMESTAMP, "developerId" uuid NOT NULL, CONSTRAINT "PK_app_notification" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "app_notification_developer_tag_unique" ON "app_notification" ("developerId", "tag")`,
        );
        await queryRunner.query(
            `ALTER TABLE "app_notification" ADD CONSTRAINT "FK_app_notification_developer" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "app_notification" DROP CONSTRAINT "FK_app_notification_developer"`,
        );
        await queryRunner.query(`DROP INDEX "app_notification_developer_tag_unique"`);
        await queryRunner.query(`DROP TABLE "app_notification"`);
        await queryRunner.query(
            `ALTER TABLE "developer_preferences" DROP CONSTRAINT "FK_developer_preferences_developer"`,
        );
        await queryRunner.query(`DROP TABLE "developer_preferences"`);
    }
}

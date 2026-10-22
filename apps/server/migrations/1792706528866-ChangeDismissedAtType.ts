import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDismissedAtType1792706528866 implements MigrationInterface {
    name = 'ChangeDismissedAtType1792706528866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_favourite_developer"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_favourite_snippet"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_favourite_collection"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_favourite_favorited_developer"`);
        await queryRunner.query(`ALTER TABLE "developer_preferences" DROP CONSTRAINT "FK_developer_preferences_developer"`);
        await queryRunner.query(`ALTER TABLE "app_notification" DROP CONSTRAINT "FK_app_notification_developer"`);
        await queryRunner.query(`ALTER TABLE "push_subscription" DROP CONSTRAINT "FK_push_subscription_developer"`);
        await queryRunner.query(`ALTER TABLE "developer" DROP COLUMN "scheduledDeletionAt"`);
        await queryRunner.query(`ALTER TABLE "developer" ADD "scheduledDeletionAt" date`);
        await queryRunner.query(`ALTER TABLE "developer_preferences" ALTER COLUMN "developerId" DROP NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."app_notification_developer_tag_unique"`);
        await queryRunner.query(`ALTER TABLE "app_notification" DROP COLUMN "dismissedAt"`);
        await queryRunner.query(`ALTER TABLE "app_notification" ADD "dismissedAt" date`);
        await queryRunner.query(`ALTER TABLE "app_notification" ALTER COLUMN "developerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "push_subscription" ALTER COLUMN "developerId" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "app_notification_developer_tag_unique" ON "app_notification" ("developerId", "tag") `);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_05be28968da8ce829b1ab777630" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_326ec4d8f249d395f0712cb373c" FOREIGN KEY ("snippetId") REFERENCES "snippet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_f367ca5347aed198266dbbb89bd" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_331bb1fa017645ec6dac4f2d6eb" FOREIGN KEY ("favoritedDeveloperId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "developer_preferences" ADD CONSTRAINT "FK_c0fc615950be67e2696f1b5f589" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_notification" ADD CONSTRAINT "FK_db4a96a21700ba7b8db3cd8e8ec" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "push_subscription" ADD CONSTRAINT "FK_57f361cb1f47a9c28b270209653" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push_subscription" DROP CONSTRAINT "FK_57f361cb1f47a9c28b270209653"`);
        await queryRunner.query(`ALTER TABLE "app_notification" DROP CONSTRAINT "FK_db4a96a21700ba7b8db3cd8e8ec"`);
        await queryRunner.query(`ALTER TABLE "developer_preferences" DROP CONSTRAINT "FK_c0fc615950be67e2696f1b5f589"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_331bb1fa017645ec6dac4f2d6eb"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_f367ca5347aed198266dbbb89bd"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_326ec4d8f249d395f0712cb373c"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_05be28968da8ce829b1ab777630"`);
        await queryRunner.query(`DROP INDEX "public"."app_notification_developer_tag_unique"`);
        await queryRunner.query(`ALTER TABLE "push_subscription" ALTER COLUMN "developerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "app_notification" ALTER COLUMN "developerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "app_notification" DROP COLUMN "dismissedAt"`);
        await queryRunner.query(`ALTER TABLE "app_notification" ADD "dismissedAt" TIMESTAMP`);
        await queryRunner.query(`CREATE UNIQUE INDEX "app_notification_developer_tag_unique" ON "app_notification" ("developerId", "tag") `);
        await queryRunner.query(`ALTER TABLE "developer_preferences" ALTER COLUMN "developerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "developer" DROP COLUMN "scheduledDeletionAt"`);
        await queryRunner.query(`ALTER TABLE "developer" ADD "scheduledDeletionAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "push_subscription" ADD CONSTRAINT "FK_push_subscription_developer" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_notification" ADD CONSTRAINT "FK_app_notification_developer" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "developer_preferences" ADD CONSTRAINT "FK_developer_preferences_developer" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_favourite_favorited_developer" FOREIGN KEY ("favoritedDeveloperId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_favourite_collection" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_favourite_snippet" FOREIGN KEY ("snippetId") REFERENCES "snippet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_favourite_developer" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

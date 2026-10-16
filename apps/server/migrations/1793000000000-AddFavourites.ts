import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFavourites1793000000000 implements MigrationInterface {
    name = 'AddFavourites1793000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "favourite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "developerId" uuid NOT NULL, "snippetId" uuid, "collectionId" uuid, "favoritedDeveloperId" uuid, CONSTRAINT "favourite_single_target" CHECK ((("snippetId" IS NOT NULL AND "collectionId" IS NULL AND "favoritedDeveloperId" IS NULL) OR ("snippetId" IS NULL AND "collectionId" IS NOT NULL AND "favoritedDeveloperId" IS NULL) OR ("snippetId" IS NULL AND "collectionId" IS NULL AND "favoritedDeveloperId" IS NOT NULL))), CONSTRAINT "PK_favourite" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "favourite_developer_snippet_unique" ON "favourite" ("developerId", "snippetId")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "favourite_developer_collection_unique" ON "favourite" ("developerId", "collectionId")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "favourite_developer_favorited_developer_unique" ON "favourite" ("developerId", "favoritedDeveloperId")`,
        );
        await queryRunner.query(
            `ALTER TABLE "favourite" ADD CONSTRAINT "FK_favourite_developer" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "favourite" ADD CONSTRAINT "FK_favourite_snippet" FOREIGN KEY ("snippetId") REFERENCES "snippet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "favourite" ADD CONSTRAINT "FK_favourite_collection" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "favourite" ADD CONSTRAINT "FK_favourite_favorited_developer" FOREIGN KEY ("favoritedDeveloperId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_favourite_favorited_developer"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_favourite_collection"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_favourite_snippet"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_favourite_developer"`);
        await queryRunner.query(`DROP TABLE "favourite"`);
    }
}

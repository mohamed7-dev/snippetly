import { MigrationInterface, QueryRunner } from "typeorm";

export class InitializeDbSchema1790006351391 implements MigrationInterface {
    name = 'InitializeDbSchema1790006351391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "authentication_method" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "identifier" character varying, "password" character varying, "verificationToken" character varying, "passwordResetToken" character varying, "identifierChangeToken" character varying, "identifierPlaceholder" character varying, "provider" character varying, "metadata" text, "type" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_e204686018c3c60f6164e385081" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_00cbe87bc0d4e36758d61bd31d" ON "authentication_method" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a23445b2c942d8dfcae15b8de2" ON "authentication_method" ("type") `);
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "permissions" text NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "invalidated" boolean NOT NULL, "authenticationStrategy" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" date, "identifier" character varying NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, "lastAuthenticatedAt" date, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "administrator" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" date, "username" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "userId" uuid, CONSTRAINT "REL_1966e18ce6a39a82b19204704d" UNIQUE ("userId"), CONSTRAINT "PK_ee58e71b3b4008b20ddc7b3092b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "friendship" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, "acceptedAt" date, "rejectedAt" date, "cancelledAt" date, "requesterId" uuid, "addresseeId" uuid, CONSTRAINT "PK_dbd6fb568cd912c5140307075cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "friendship_requester_addressee_unique" ON "friendship" ("requesterId", "addresseeId") `);
        await queryRunner.query(`CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "usageCount" integer NOT NULL DEFAULT '0', "addedById" uuid, CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fbbecbf5974405cb19dbd2f243" ON "tag" ("value") `);
        await queryRunner.query(`CREATE TABLE "snippet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" date, "name" character varying NOT NULL, "slug" character varying NOT NULL, "code" text NOT NULL, "language" character varying NOT NULL, "description" character varying, "note" character varying, "isPrivate" boolean NOT NULL DEFAULT false, "allowForking" boolean NOT NULL DEFAULT true, "forkedFromId" uuid, "creatorId" uuid, "collectionId" uuid, CONSTRAINT "PK_70387b18f1ab2e9cdd22a710fcf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6cbecd384d0b94e5f690999317" ON "snippet" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_44d315098593ce1fbbb315164b" ON "snippet" ("forkedFromId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2faaf0d10dee171f25620eb013" ON "snippet" ("creatorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_00eed1534bb7097f63641f9e4d" ON "snippet" ("collectionId") `);
        await queryRunner.query(`CREATE TABLE "developer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" date, "emailAddress" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "bio" character varying, "image" character varying, "imageKey" character varying, "isPrivate" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "REL_cc6fed0de92da43127fd5a5fb8" UNIQUE ("userId"), CONSTRAINT "PK_71b846918f80786eed6bfb68b77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "collection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" date, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "color" character varying NOT NULL, "isPrivate" boolean NOT NULL DEFAULT false, "allowForking" boolean NOT NULL DEFAULT true, "creatorId" uuid, "forked_from" uuid, CONSTRAINT "PK_ad3f485bbc99d875491f44d7c85" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_75a6fd6eedd7fa7378de400b0a" ON "collection" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_a228386bbbd59fa3ab75483b95" ON "collection" ("creatorId") `);
        await queryRunner.query(`CREATE TABLE "user_roles_role" ("userId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId") `);
        await queryRunner.query(`CREATE TABLE "snippet_tags_tag" ("snippetId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_97751f7370bef8e27d66621ecec" PRIMARY KEY ("snippetId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4cc351c82a0b98e06b256b8576" ON "snippet_tags_tag" ("snippetId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3e1456d333910cebbd3b36195c" ON "snippet_tags_tag" ("tagId") `);
        await queryRunner.query(`CREATE TABLE "collection_tags_tag" ("collectionId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_5a0c8519c4205a5c7641ac410ae" PRIMARY KEY ("collectionId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_944a52b290a00504fa03a0050e" ON "collection_tags_tag" ("collectionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3a9a90a4b09eb51cbeac1e12e2" ON "collection_tags_tag" ("tagId") `);
        await queryRunner.query(`ALTER TABLE "authentication_method" ADD CONSTRAINT "FK_00cbe87bc0d4e36758d61bd31d6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "administrator" ADD CONSTRAINT "FK_1966e18ce6a39a82b19204704d7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_b29f15b88ee36453605ade63cb2" FOREIGN KEY ("requesterId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_8012340b570c83b55e0d3ef829a" FOREIGN KEY ("addresseeId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "FK_b78c1467a9cc5cc308e9231b2ee" FOREIGN KEY ("addedById") REFERENCES "developer"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "snippet" ADD CONSTRAINT "FK_44d315098593ce1fbbb315164b8" FOREIGN KEY ("forkedFromId") REFERENCES "snippet"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "snippet" ADD CONSTRAINT "FK_2faaf0d10dee171f25620eb0134" FOREIGN KEY ("creatorId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "snippet" ADD CONSTRAINT "FK_00eed1534bb7097f63641f9e4db" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "developer" ADD CONSTRAINT "FK_cc6fed0de92da43127fd5a5fb84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collection" ADD CONSTRAINT "FK_a228386bbbd59fa3ab75483b953" FOREIGN KEY ("creatorId") REFERENCES "developer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collection" ADD CONSTRAINT "FK_3f64188013174055355aa7587f1" FOREIGN KEY ("forked_from") REFERENCES "collection"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "snippet_tags_tag" ADD CONSTRAINT "FK_4cc351c82a0b98e06b256b8576e" FOREIGN KEY ("snippetId") REFERENCES "snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "snippet_tags_tag" ADD CONSTRAINT "FK_3e1456d333910cebbd3b36195c9" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collection_tags_tag" ADD CONSTRAINT "FK_944a52b290a00504fa03a0050e2" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "collection_tags_tag" ADD CONSTRAINT "FK_3a9a90a4b09eb51cbeac1e12e28" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collection_tags_tag" DROP CONSTRAINT "FK_3a9a90a4b09eb51cbeac1e12e28"`);
        await queryRunner.query(`ALTER TABLE "collection_tags_tag" DROP CONSTRAINT "FK_944a52b290a00504fa03a0050e2"`);
        await queryRunner.query(`ALTER TABLE "snippet_tags_tag" DROP CONSTRAINT "FK_3e1456d333910cebbd3b36195c9"`);
        await queryRunner.query(`ALTER TABLE "snippet_tags_tag" DROP CONSTRAINT "FK_4cc351c82a0b98e06b256b8576e"`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_4be2f7adf862634f5f803d246b8"`);
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_5f9286e6c25594c6b88c108db77"`);
        await queryRunner.query(`ALTER TABLE "collection" DROP CONSTRAINT "FK_3f64188013174055355aa7587f1"`);
        await queryRunner.query(`ALTER TABLE "collection" DROP CONSTRAINT "FK_a228386bbbd59fa3ab75483b953"`);
        await queryRunner.query(`ALTER TABLE "developer" DROP CONSTRAINT "FK_cc6fed0de92da43127fd5a5fb84"`);
        await queryRunner.query(`ALTER TABLE "snippet" DROP CONSTRAINT "FK_00eed1534bb7097f63641f9e4db"`);
        await queryRunner.query(`ALTER TABLE "snippet" DROP CONSTRAINT "FK_2faaf0d10dee171f25620eb0134"`);
        await queryRunner.query(`ALTER TABLE "snippet" DROP CONSTRAINT "FK_44d315098593ce1fbbb315164b8"`);
        await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "FK_b78c1467a9cc5cc308e9231b2ee"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_8012340b570c83b55e0d3ef829a"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_b29f15b88ee36453605ade63cb2"`);
        await queryRunner.query(`ALTER TABLE "administrator" DROP CONSTRAINT "FK_1966e18ce6a39a82b19204704d7"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`ALTER TABLE "authentication_method" DROP CONSTRAINT "FK_00cbe87bc0d4e36758d61bd31d6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a9a90a4b09eb51cbeac1e12e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_944a52b290a00504fa03a0050e"`);
        await queryRunner.query(`DROP TABLE "collection_tags_tag"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e1456d333910cebbd3b36195c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4cc351c82a0b98e06b256b8576"`);
        await queryRunner.query(`DROP TABLE "snippet_tags_tag"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4be2f7adf862634f5f803d246b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f9286e6c25594c6b88c108db7"`);
        await queryRunner.query(`DROP TABLE "user_roles_role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a228386bbbd59fa3ab75483b95"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75a6fd6eedd7fa7378de400b0a"`);
        await queryRunner.query(`DROP TABLE "collection"`);
        await queryRunner.query(`DROP TABLE "developer"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_00eed1534bb7097f63641f9e4d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2faaf0d10dee171f25620eb013"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_44d315098593ce1fbbb315164b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6cbecd384d0b94e5f690999317"`);
        await queryRunner.query(`DROP TABLE "snippet"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fbbecbf5974405cb19dbd2f243"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP INDEX "public"."friendship_requester_addressee_unique"`);
        await queryRunner.query(`DROP TABLE "friendship"`);
        await queryRunner.query(`DROP TABLE "administrator"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a23445b2c942d8dfcae15b8de2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_00cbe87bc0d4e36758d61bd31d"`);
        await queryRunner.query(`DROP TABLE "authentication_method"`);
    }

}

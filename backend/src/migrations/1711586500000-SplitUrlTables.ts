import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitUrlTables1711586500000 implements MigrationInterface {
  name = 'SplitUrlTables1711586500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create canonical_urls table
    await queryRunner.query(`
      CREATE TABLE "canonical_urls" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "canonicalUrl" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_canonical_urls_canonicalUrl" UNIQUE ("canonicalUrl"),
        CONSTRAINT "PK_canonical_urls" PRIMARY KEY ("id")
      );
    `);

    // Create aliases table
    await queryRunner.query(`
      CREATE TABLE "aliases" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "alias" character varying NOT NULL,
        "visits" integer NOT NULL DEFAULT 0,
        "userId" uuid,
        "canonicalUrlId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_aliases_alias" UNIQUE ("alias"),
        CONSTRAINT "PK_aliases" PRIMARY KEY ("id")
      );
      
      ALTER TABLE "aliases" ADD CONSTRAINT "FK_aliases_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      ALTER TABLE "aliases" ADD CONSTRAINT "FK_aliases_canonicalUrlId" FOREIGN KEY ("canonicalUrlId") REFERENCES "canonical_urls"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    // Migrate data from urls to canonical_urls and aliases
    await queryRunner.query(`
      -- Insert into canonical_urls
      INSERT INTO "canonical_urls" ("canonicalUrl")
      SELECT DISTINCT "originalUrl" FROM "urls";
      
      -- Insert into aliases
      INSERT INTO "aliases" ("alias", "visits", "userId", "canonicalUrlId")
      SELECT u."slug", u."visits", u."userId", c."id"
      FROM "urls" u
      JOIN "canonical_urls" c ON u."originalUrl" = c."canonicalUrl";
    `);

    // We keep the urls table for backward compatibility
    // It will be removed in a future migration after all code is updated
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "aliases" DROP CONSTRAINT "FK_aliases_canonicalUrlId"`);
    await queryRunner.query(`ALTER TABLE "aliases" DROP CONSTRAINT "FK_aliases_userId"`);
    
    // Drop tables
    await queryRunner.query(`DROP TABLE "aliases"`);
    await queryRunner.query(`DROP TABLE "canonical_urls"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1711586400000 implements MigrationInterface {
  name = 'InitialSchema1711586400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TYPE "users_provider_enum" AS ENUM ('local', 'google');
      
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying,
        "firstName" character varying,
        "lastName" character varying,
        "provider" "users_provider_enum" NOT NULL DEFAULT 'local',
        "googleId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      );
    `);

    // Create urls table (legacy table, will be replaced in next migration)
    await queryRunner.query(`
      CREATE TABLE "urls" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "originalUrl" character varying NOT NULL,
        "visits" integer NOT NULL DEFAULT 0,
        "userId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_urls_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_urls" PRIMARY KEY ("id")
      );
      
      ALTER TABLE "urls" ADD CONSTRAINT "FK_urls_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "urls" DROP CONSTRAINT "FK_urls_userId"`);
    await queryRunner.query(`DROP TABLE "urls"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_provider_enum"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnonymousUser1711586600000 implements MigrationInterface {
  name = 'AddAnonymousUser1711586600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert the anonymous user with a fixed UUID
    await queryRunner.query(`
      INSERT INTO "users" ("id", "email", "firstName", "lastName", "provider")
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        'anonymous@url-shortener.local',
        'Anonymous',
        'User',
        'local'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "users"
      WHERE "id" = '00000000-0000-0000-0000-000000000000';
    `);
  }
}

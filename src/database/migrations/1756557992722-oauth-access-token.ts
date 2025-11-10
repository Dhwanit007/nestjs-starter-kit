import { MigrationInterface, QueryRunner } from 'typeorm';

export class OauthAccessToken1756557992722 implements MigrationInterface {
  name = 'OauthAccessToken1756557992722';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`oauth_access_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`tokenId\` varchar(255) NOT NULL, \`expiresAt\` datetime NOT NULL, \`revoked\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(`DROP TABLE \`oauth_access_tokens\``);
  }
}

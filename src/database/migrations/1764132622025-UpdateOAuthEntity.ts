import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOAuthEntity1764132622025 implements MigrationInterface {
    name = 'UpdateOAuthEntity1764132622025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`oauth_access_tokens\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`oauth_access_tokens\` ADD \`userId\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`oauth_access_tokens\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`oauth_access_tokens\` ADD \`userId\` int NOT NULL`);
    }

}

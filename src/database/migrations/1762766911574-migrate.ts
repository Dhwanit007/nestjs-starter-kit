import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1762766911574 implements MigrationInterface {
    name = 'Migrate1762766911574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat\` CHANGE \`name\` \`content\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`chat\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`chat\` ADD \`content\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`chat\` ADD \`content\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`chat\` CHANGE \`content\` \`name\` varchar(100) NOT NULL`);
    }

}

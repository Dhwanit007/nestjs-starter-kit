import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersTable1764321863977 implements MigrationInterface {
    name = 'UpdateUsersTable1764321863977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`dob\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`language\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`gender\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`gender\` varchar(255) NOT NULL DEFAULT 'male'`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`language\` varchar(255) NOT NULL DEFAULT 'Hindi'`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`dob\` datetime NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProjectsTable1764306071388 implements MigrationInterface {
    name = 'UpdateProjectsTable1764306071388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`deadline\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`deadline\``);
    }

}

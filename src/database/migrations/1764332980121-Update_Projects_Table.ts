import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProjectsTable1764332980121 implements MigrationInterface {
    name = 'UpdateProjectsTable1764332980121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`description\` longtext NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`description\` varchar(255) NULL`);
    }

}

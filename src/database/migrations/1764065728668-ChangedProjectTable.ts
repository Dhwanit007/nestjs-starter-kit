import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedProjectTable1764065728668 implements MigrationInterface {
    name = 'ChangedProjectTable1764065728668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`status\` enum ('Active', 'Completed') NOT NULL DEFAULT 'Active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`status\``);
    }

}

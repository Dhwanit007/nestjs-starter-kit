import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDepartmentsTable1764243711644 implements MigrationInterface {
    name = 'UpdateDepartmentsTable1764243711644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`departments\` DROP COLUMN \`assignedEmployeeIds\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`departments\` ADD \`assignedEmployeeIds\` json NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedEmployeesTable1764069661154 implements MigrationInterface {
    name = 'UpdatedEmployeesTable1764069661154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_9ad20e4029f9458b6eed0b0c454\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`departmentId\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`departmentId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD CONSTRAINT \`FK_9ad20e4029f9458b6eed0b0c454\` FOREIGN KEY (\`departmentId\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_9ad20e4029f9458b6eed0b0c454\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`departmentId\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`departmentId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD CONSTRAINT \`FK_9ad20e4029f9458b6eed0b0c454\` FOREIGN KEY (\`departmentId\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

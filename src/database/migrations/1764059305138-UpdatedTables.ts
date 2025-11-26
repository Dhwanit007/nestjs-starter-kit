import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedTables1764059305138 implements MigrationInterface {
    name = 'UpdatedTables1764059305138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`projects_employees_employee\` (\`projectsId\` varchar(36) NOT NULL, \`employeeId\` varchar(36) NOT NULL, INDEX \`IDX_6d6b378a24109e1c5a70e68456\` (\`projectsId\`), INDEX \`IDX_6d36a9cce31a9676e5cf530b04\` (\`employeeId\`), PRIMARY KEY (\`projectsId\`, \`employeeId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`departmentId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD CONSTRAINT \`FK_9ad20e4029f9458b6eed0b0c454\` FOREIGN KEY (\`departmentId\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`projects_employees_employee\` ADD CONSTRAINT \`FK_6d6b378a24109e1c5a70e684564\` FOREIGN KEY (\`projectsId\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`projects_employees_employee\` ADD CONSTRAINT \`FK_6d36a9cce31a9676e5cf530b044\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects_employees_employee\` DROP FOREIGN KEY \`FK_6d36a9cce31a9676e5cf530b044\``);
        await queryRunner.query(`ALTER TABLE \`projects_employees_employee\` DROP FOREIGN KEY \`FK_6d6b378a24109e1c5a70e684564\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_9ad20e4029f9458b6eed0b0c454\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`departmentId\``);
        await queryRunner.query(`DROP INDEX \`IDX_6d36a9cce31a9676e5cf530b04\` ON \`projects_employees_employee\``);
        await queryRunner.query(`DROP INDEX \`IDX_6d6b378a24109e1c5a70e68456\` ON \`projects_employees_employee\``);
        await queryRunner.query(`DROP TABLE \`projects_employees_employee\``);
    }

}

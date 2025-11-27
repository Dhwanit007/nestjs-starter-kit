import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDepartmentTable1764218950764 implements MigrationInterface {
    name = 'UpdateDepartmentTable1764218950764'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`departments\` ADD UNIQUE INDEX \`IDX_8681da666ad9699d568b3e9106\` (\`name\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`departments\` DROP INDEX \`IDX_8681da666ad9699d568b3e9106\``);
    }

}

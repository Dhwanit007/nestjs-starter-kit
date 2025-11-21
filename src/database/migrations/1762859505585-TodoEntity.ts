import { MigrationInterface, QueryRunner } from "typeorm";

export class TodoEntity1762859505585 implements MigrationInterface {
    name = 'TodoEntity1762859505585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`todos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`task\` varchar(255) NOT NULL, \`completed\` tinyint NOT NULL DEFAULT 0, \`date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`todos\``);
    }

}

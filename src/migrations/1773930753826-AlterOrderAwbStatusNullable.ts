import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterOrderAwbStatusNullable1773930753826 implements MigrationInterface {
    name = 'AlterOrderAwbStatusNullable1773930753826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "awb_status" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "awb_status" SET NOT NULL`);
    }

}

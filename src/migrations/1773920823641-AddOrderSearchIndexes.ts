import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderSearchIndexes1773920823641 implements MigrationInterface {
  name = 'AddOrderSearchIndexes1773920823641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(
      `CREATE INDEX "idx_orders_phone_number" ON "orders" USING gin ("phone_number" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_recipient_name" ON "orders" USING gin ("recipient_name" gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_orders_recipient_name"`);
    await queryRunner.query(`DROP INDEX "idx_orders_phone_number"`);
  }
}
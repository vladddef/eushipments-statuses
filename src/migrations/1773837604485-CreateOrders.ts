import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrders1773837604485 implements MigrationInterface {
  name = 'CreateOrders1773837604485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'abw_number',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'recipient_name',
            type: 'varchar',
          },
          {
            name: 'reference_number',
            type: 'varchar',
          },
          {
            name: 'sender_id',
            type: 'varchar',
          },
          {
            name: 'city_name',
            type: 'varchar',
          },
          {
            name: 'street_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'parcels',
            type: 'int',
            default: 1,
          },
          {
            name: 'cod',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'awb_status',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSyncRuns1773835398152 implements MigrationInterface {
  name = 'CreateSyncRuns1773835398152';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "sync_runs_status_enum" AS ENUM('running', 'completed', 'failed')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'sync_runs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['running', 'completed', 'failed'],
            default: `'running'`,
          },
          {
            name: 'started_at',
            type: 'timestamptz',
          },
          {
            name: 'finished_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'notified_at',
            type: 'timestamptz',
            isNullable: true,
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

    await queryRunner.query(
      `CREATE INDEX if not exists "IDX_sync_runs_name_finished_at" ON "sync_runs" ("name" DESC, "finished_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX if exists "IDX_sync_runs_name_finished_at"`,
    );
    await queryRunner.dropTable('sync_runs');
    await queryRunner.query(`DROP TYPE if exists "sync_runs_status_enum"`);
  }
}

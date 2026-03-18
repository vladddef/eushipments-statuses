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
            name: 'startedAt',
            type: 'timestamptz',
          },
          {
            name: 'finishedAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'notifiedAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_sync_runs_name_finished_at" ON "sync_runs" ("name" DESC, "finishedAt" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_sync_runs_name_finished_at"`);
    await queryRunner.dropTable('sync_runs');
    await queryRunner.query(`DROP TYPE "sync_runs_status_enum"`);
  }
}

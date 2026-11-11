import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: './proyecto.db',
  driver: SqliteDriver,
  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
  },
});

export const SyncSchema = async () => {
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();
};

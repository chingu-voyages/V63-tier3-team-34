import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from './index.js'

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: './drizzle' })
}

if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(() => {
      console.log('Migrations applied')
      return pool.end()
    })
    .catch((err) => {
      console.error('Migration failed', err)
      process.exit(1)
    })
}

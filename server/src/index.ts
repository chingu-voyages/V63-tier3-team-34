import { app } from './app.js'
import { config } from './config.js'
import { runMigrations } from './db/migrate.js'

await runMigrations()

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port} (${config.nodeEnv})`)
})

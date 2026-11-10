import 'dotenv/config'

const port = Number(process.env.PORT ?? 3000)

export const config = {
  port: Number.isFinite(port) ? port : 3000,
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/app',
} as const

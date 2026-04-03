import { config } from 'dotenv'
import type { Config } from 'drizzle-kit'

// drizzle-kit runs outside Next.js and doesn't auto-load .env.local
config({ path: '.env.local' })

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config

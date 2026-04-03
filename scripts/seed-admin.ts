/**
 * Seed the initial admin user.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-admin.ts
 *
 * Override defaults via env vars:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret npx tsx --env-file=.env.local scripts/seed-admin.ts
 */

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import bcrypt from 'bcryptjs'
import { usuarios } from '../db/schema'
import { eq } from 'drizzle-orm'

const email = process.env.ADMIN_EMAIL ?? 'admin@complejo.com'
const password = process.env.ADMIN_PASSWORD ?? 'admin1234'

async function main() {
  const client = postgres(process.env.DATABASE_URL!)
  const db = drizzle(client)

  const existing = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.email, email))
    .limit(1)

  if (existing.length > 0) {
    console.log(`Usuario ${email} ya existe. Nada que hacer.`)
    await client.end()
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db.insert(usuarios).values({
    email,
    rol: 'admin',
    hashedPassword,
  })

  console.log(`✓ Admin creado: ${email}`)
  console.log(`  Contraseña temporal: ${password}`)
  console.log(`  Cambiala después del primer login.`)

  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

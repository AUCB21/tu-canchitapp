/**
 * Seed the initial admin user.
 *
 * Since auth is now handled by Supabase, this script creates the user in
 * supabase.auth.users via the Admin API, then inserts the app-level record.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-admin.ts
 *
 * Override defaults via env vars:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret npx tsx --env-file=.env.local scripts/seed-admin.ts
 */

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { createClient } from '@supabase/supabase-js'
import { usuarios } from '../db/schema'
import { eq } from 'drizzle-orm'

const email = process.env.ADMIN_EMAIL ?? 'admin@complejo.com'
const password = process.env.ADMIN_PASSWORD ?? 'admin1234'

async function main() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const client = postgres(process.env.DATABASE_URL!)
  const db = drizzle(client)

  const existing = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).limit(1)

  if (existing.length > 0) {
    console.log(`Usuario ${email} ya existe. Nada que hacer.`)
    await client.end()
    return
  }

  // Create in Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    console.error('Error creando usuario en Supabase:', error?.message)
    await client.end()
    process.exit(1)
  }

  // Insert app-level record
  await db.insert(usuarios).values({ id: data.user.id, email, rol: 'admin' })

  console.log(`✓ Admin creado: ${email}`)
  console.log(`  Contraseña temporal: ${password}`)
  console.log(`  Cambiala después del primer login.`)

  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

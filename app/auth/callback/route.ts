import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure app-level usuarios row exists (created on first confirmation)
      const existing = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.id, data.user.id)).limit(1)
      if (existing.length === 0) {
        await db.insert(usuarios).values({
          id: data.user.id,
          email: data.user.email ?? '',
          rol: 'staff',
        })
      }

      if (next === '/reset-password') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export type AppSession = {
  userId: string
  email: string
  rol: 'admin' | 'staff'
}

export async function requireRole(role: 'admin' | 'staff'): Promise<AppSession> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, user.id)).limit(1)
  if (!usuario) redirect('/login')

  if (role === 'admin' && usuario.rol !== 'admin') redirect('/')

  return { userId: user.id, email: user.email ?? '', rol: usuario.rol }
}

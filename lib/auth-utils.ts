import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * Require a valid session. If role is 'admin', also require admin.
 * Use in Server Components and Server Actions.
 */
export async function requireRole(role: 'admin' | 'staff') {
  const session = await auth()
  if (!session) redirect('/login')
  if (role === 'admin' && session.user.rol !== 'admin') redirect('/')
  return session
}

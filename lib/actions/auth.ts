'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(_prev: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return 'Email o contraseña incorrectos'
  redirect('/')
}

export async function registerAction(_prev: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) return 'Las contraseñas no coinciden'
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return error.message
  // usuarios row is created in /auth/callback after email confirmation
  return 'CONFIRM_EMAIL'
}

export async function forgotPasswordAction(_prev: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback?next=/reset-password`,
  })
  if (error) return error.message
  return null // null = success
}

export async function resetPasswordAction(_prev: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) return 'Las contraseñas no coinciden'
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return error.message
  redirect('/')
}

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [user] = await db
          .select()
          .from(usuarios)
          .where(eq(usuarios.email, credentials.email as string))
          .limit(1)

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        )

        if (!passwordMatch) return null

        return {
          id: String(user.id),
          email: user.email,
          rol: user.rol,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol = user.rol
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.rol = token.rol as 'admin' | 'staff'
      session.user.id = token.id as string
      return session
    },
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
})

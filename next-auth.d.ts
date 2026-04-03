import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    rol: 'admin' | 'staff'
  }
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      rol: 'admin' | 'staff'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    rol?: 'admin' | 'staff'
    id?: string
  }
}

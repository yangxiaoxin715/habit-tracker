import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'
import NextAuth from "next-auth"

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      phone?: string | null
      role?: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    name?: string | null
    phone?: string | null
    role?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    phone?: string
    role?: string
  }
} 
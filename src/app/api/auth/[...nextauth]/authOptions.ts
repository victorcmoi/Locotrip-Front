import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginApiResponseSchema } from '@/schemas/user';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
    };
  }
  interface User {
    accessToken: string;
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.email = user.email;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = {
        id: token.id as string,
        email: token.email as string,
        first_name: token.first_name as string,
        last_name: token.last_name as string,
        role: token.role as string,
      };
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials, request) {
        const { email, password } = credentials ?? {};
        if (!email || !password) {
          throw new Error('Missing username or password');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': request.headers?.['x-forwarded-for']
          },
          body: JSON.stringify({
            email,
            password
          }),
        });

        const json = await response.json();

        if (response.ok) {
          const data = loginApiResponseSchema.parse(json);
          return { 
            id: data.user.id, 
            email: data.user.email, 
            first_name: data.user.firstName || '',
            last_name: data.user.lastName || '',
            role: data.user.role || 'client',
            accessToken: data.token
          }
        }

        throw new Error(json.message);
      },
    }),
  ],
};

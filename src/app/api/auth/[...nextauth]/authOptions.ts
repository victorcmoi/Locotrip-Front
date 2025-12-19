import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SessionUser } from '@/schemas/user';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: SessionUser;
  }
  interface User extends SessionUser {
    accessToken: string;
  }
}

export const authOptions: NextAuthOptions = {
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
        role: token.role as 'admin' | 'guide' | 'client',
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

        console.log(response);

        const user = await response.json();

        if (response.ok) {
          return { 
            id: user.id, 
            email: user.email, 
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            role: user.role || 'client',
            accessToken: user.token
          }
        }

        throw new Error(user.message);
      },
    }),
  ],
};

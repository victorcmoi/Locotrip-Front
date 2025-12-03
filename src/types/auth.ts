// Types pour l'authentification

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'CLIENT' | 'GUIDE' | 'ADMIN';
}

export interface AuthResponse extends AuthTokens {
  user?: User;
}

// Types NextAuth
declare module "next-auth" {
  interface Session {
    user: User & { name: string };
    accessToken: string;
    refreshToken: string;
  }

  interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    name: string;
    role: 'CLIENT' | 'GUIDE' | 'ADMIN';
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    name: string;
    role: 'CLIENT' | 'GUIDE' | 'ADMIN';
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }
}

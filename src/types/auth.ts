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

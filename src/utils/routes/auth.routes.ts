/**
 * Routes d'authentification
 */
class AuthRoutes {
  private static readonly BASE = '/auth';

  static readonly LOGIN = '/login';
  static readonly REGISTER = '/register';
  static readonly FORGOT_PASSWORD = `${this.BASE}/forgot-password`;
  static readonly RESET_PASSWORD = `${this.BASE}/reset-password`;
  static readonly VERIFY_EMAIL = `${this.BASE}/verify-email`;
  static readonly LOGOUT = `${this.BASE}/logout`;
}

export default AuthRoutes;

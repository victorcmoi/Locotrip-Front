/**
 * Routes pour le profil utilisateur
 */
class UserRoutes {
  private static readonly BASE = '/profile';

  static readonly PROFILE = this.BASE;
  static readonly EDIT = `${this.BASE}/edit`;
  static readonly SETTINGS = `${this.BASE}/settings`;
  static readonly NOTIFICATIONS_SETTINGS = `${this.BASE}/notifications`;
  static readonly DELETE_ACCOUNT = `${this.BASE}/delete-account`;
  static readonly MY_REVIEWS = `${this.BASE}/reviews`;
}

export default UserRoutes;

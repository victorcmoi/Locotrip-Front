/**
 * Routes pour les guides
 */
class GuidesRoutes {
  private static readonly BASE = '/guides';
  static readonly LIST = this.BASE;
  static readonly BECOME_GUIDE = `${this.BASE}/become-guide`;
  static readonly DASHBOARD = `${this.BASE}/dashboard`;
  static readonly MY_EXPERIENCES = `${this.BASE}/my-experiences`;
  static readonly STATISTICS = `${this.BASE}/statistics`;
  static readonly CALENDAR = `${this.BASE}/calendar`;
  
  // Routes paramétrées
  static readonly PROFILE = (id: string) => `${this.BASE}/${id}`;
  static readonly REVIEWS = (id: string) => `${this.BASE}/${id}/reviews`;
  static readonly AVAILABILITY = (id: string) => `${this.BASE}/${id}/availability`;
}

export default GuidesRoutes;

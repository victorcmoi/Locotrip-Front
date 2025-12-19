/**
 * Routes pour les expériences
 */
class ExperiencesRoutes {
  private static readonly BASE = '/experiences';

  static readonly LIST = this.BASE;
  static readonly CREATE = `${this.BASE}/create`;
  static readonly CATEGORIES = `${this.BASE}/categories`;
  static readonly CITIES = `${this.BASE}/cities`;
  
  // Routes paramétrées
  static readonly DETAIL = (id: string) => `${this.BASE}/${id}`;
  static readonly EDIT = (id: string) => `${this.BASE}/${id}/edit`;
  static readonly DELETE = (id: string) => `${this.BASE}/${id}/delete`;
  static readonly CATEGORY = (categoryId: string) => `${this.BASE}/categories/${categoryId}`;
  static readonly CITY = (citySlug: string) => `${this.BASE}/cities/${citySlug}`;
}

export default ExperiencesRoutes;

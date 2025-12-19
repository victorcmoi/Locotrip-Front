/**
 * Routes pour les avis
 */
class ReviewsRoutes {
  private static readonly BASE = '/reviews';

  static readonly LIST = this.BASE;
  static readonly CREATE = `${this.BASE}/create`;
  
  // Routes paramétrées
  static readonly DETAIL = (id: string) => `${this.BASE}/${id}`;
  static readonly EDIT = (id: string) => `${this.BASE}/${id}/edit`;
  static readonly DELETE = (id: string) => `${this.BASE}/${id}/delete`;
  static readonly FOR_EXPERIENCE = (experienceId: string) => `${this.BASE}/experience/${experienceId}`;
  static readonly FOR_GUIDE = (guideId: string) => `${this.BASE}/guide/${guideId}`;
}

export default ReviewsRoutes;

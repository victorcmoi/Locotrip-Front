/**
 * Export centralisé de toutes les routes
 * 
 * Usage:
 * import { AUTH_ROUTES, HOME_ROUTES } from '@/utils/routes'
 * ou
 * import Routes from '@/utils/routes'
 */

import AuthRoutes from './auth.routes';
import HomeRoutes from './home.routes';
import ExperiencesRoutes from './experiences.routes';
import BookingsRoutes from './bookings.routes';
import GuidesRoutes from './guides.routes';
import UserRoutes from './user.routes';
import ReviewsRoutes from './reviews.routes';
import SupportRoutes from './support.routes';
import MessagerieRoutes from './messagerie.routes';

// Export nommé pour utilisation directe
export const AUTH_ROUTES = AuthRoutes;
export const HOME_ROUTES = HomeRoutes;
export const EXPERIENCES_ROUTES = ExperiencesRoutes;
export const BOOKINGS_ROUTES = BookingsRoutes;
export const GUIDES_ROUTES = GuidesRoutes;
export const USER_ROUTES = UserRoutes;
export const REVIEWS_ROUTES = ReviewsRoutes;
export const SUPPORT_ROUTES = SupportRoutes;
export const MESSAGERIE_ROUTES = MessagerieRoutes;

// Export par défaut - objet contenant toutes les routes
const Routes = {
  AUTH: AuthRoutes,
  HOME: HomeRoutes,
  EXPERIENCES: ExperiencesRoutes,
  BOOKINGS: BookingsRoutes,
  GUIDES: GuidesRoutes,
  USER: UserRoutes,
  REVIEWS: ReviewsRoutes,
  SUPPORT: SupportRoutes,
  MESSAGERIE: MessagerieRoutes,
} as const;

export default Routes;

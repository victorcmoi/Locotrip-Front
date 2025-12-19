/**
 * Routes pour les réservations
 */
class BookingsRoutes {
  private static readonly BASE = '/bookings';

  static readonly LIST = this.BASE;
  static readonly CREATE = `${this.BASE}/create`;
  static readonly MY_BOOKINGS = `${this.BASE}/my-bookings`;
  
  // Routes paramétrées
  static readonly DETAIL = (id: string) => `${this.BASE}/${id}`;
  static readonly EDIT = (id: string) => `${this.BASE}/${id}/edit`;
  static readonly CANCEL = (id: string) => `${this.BASE}/${id}/cancel`;
  static readonly PAYMENTS = (id: string) => `${this.BASE}/${id}/payments`;
  static readonly PAYMENT_DETAIL = (bookingId: string, paymentId: string) => 
    `${this.BASE}/${bookingId}/payments/${paymentId}`;
  static readonly DISPUTES = (id: string) => `${this.BASE}/${id}/disputes`;
  static readonly CREATE_DISPUTE = (id: string) => `${this.BASE}/${id}/disputes/create`;
}

export default BookingsRoutes;

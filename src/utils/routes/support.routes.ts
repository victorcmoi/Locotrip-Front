/**
 * Routes pour le support client
 */
class SupportRoutes {
  private static readonly BASE = '/support';

  static readonly HOME = this.BASE;
  static readonly TICKETS = `${this.BASE}/tickets`;
  static readonly CREATE_TICKET = `${this.BASE}/tickets/create`;
  static readonly FAQ = `${this.BASE}/faq`;
  static readonly CONTACT = `/contact`;
  
  // Routes paramétrées
  static readonly TICKET_DETAIL = (id: string) => `${this.BASE}/tickets/${id}`;
  static readonly TICKET_REPLY = (id: string) => `${this.BASE}/tickets/${id}/reply`;
}

export default SupportRoutes;

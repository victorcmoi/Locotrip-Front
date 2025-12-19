/**
 * Routes pour la messagerie
 */
class MessagerieRoutes {
  private static readonly BASE = '/messages';

  static readonly INBOX = this.BASE;
  static readonly SENT = `${this.BASE}/sent`;
  static readonly ARCHIVED = `${this.BASE}/archived`;
  
  // Routes paramétrées
  static readonly CONVERSATION = (id: string) => `${this.BASE}/${id}`;
  static readonly NEW_CONVERSATION = (userId: string) => `${this.BASE}/new/${userId}`;
}

export default MessagerieRoutes;

export type UserRole = 'client' | 'organisateur' | 'admin';
export type EventStatus = 'brouillon' | 'publie' | 'annule' | 'termine';
export type TicketStatus = 'valide' | 'utilise' | 'annule' | 'rembourse';
export type PaymentStatus = 'en_attente' | 'complete' | 'echoue' | 'rembourse';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  nom: string;
  description?: string;
  icone: string;
  couleur: string;
  created_at: string;
}

export interface Event {
  id: string;
  organisateur_id: string;
  category_id?: string;
  titre: string;
  description: string;
  lieu: string;
  ville: string;
  date_debut: string;
  date_fin: string;
  image_urls: string[];
  capacite_totale: number;
  statut: EventStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
  organisateur?: User;
}

export interface TicketType {
  id: string;
  event_id: string;
  nom: string;
  description?: string;
  prix: number;
  quantite_disponible: number;
  quantite_vendue: number;
  avantages: string[];
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_type_id: string;
  event_id: string;
  user_id: string;
  code_billet: string;
  nom_participant: string;
  email_participant: string;
  prix_paye: number;
  statut: TicketStatus;
  qr_code_url?: string;
  date_achat: string;
  date_utilisation?: string;
  event?: Event;
  ticket_type?: TicketType;
}

export interface Payment {
  id: string;
  user_id: string;
  montant_total: number;
  frais_service: number;
  methode_paiement: string;
  statut: PaymentStatus;
  transaction_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Review {
  id: string;
  event_id: string;
  user_id: string;
  note: number;
  commentaire?: string;
  created_at: string;
  user?: User;
}

export interface Favorite {
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface AIGeneration {
  id: string;
  user_id: string;
  event_id?: string;
  prompt: string;
  response: string;
  model: string;
  tokens_used: number;
  created_at: string;
}

export interface EventStats {
  id: string;
  titre: string;
  total_billets_vendus: number;
  revenus_total: number;
  note_moyenne: number;
  nombre_avis: number;
  capacite_totale: number;
  taux_remplissage: number;
}

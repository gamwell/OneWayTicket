// src/types.ts

// --- PROFILS ---
export interface Profile {
  id: string; // UUID
  full_name: string;
  email: string;
  // Note : profile_type_id reste souvent un number si vous n'avez pas changé profile_types en UUID
  // Si vous avez un doute, mettez : number | string
  profile_type_id: number; 
  verification_status: 'verified' | 'pending' | 'rejected';
}

export interface ProfileType {
  id: number;
  name: string; // "Étudiant", "Standard"...
  requires_proof: boolean;
}

// --- ÉVÉNEMENTS ---
export interface Event {
  id: string; // UUID
  title: string;
  description: string;
  date: string;
  location: string;
  // Ajoutez vos autres champs d'événement ici (image_url, etc.)
}

export interface TicketType {
  id: string; // UUID
  event_id: string; // UUID
  name: string; // "Fosse", "Gradin"...
  base_price: number;
  capacity: number;
}

// --- PRIX & RÉDUCTIONS (La Vue SQL) ---
export interface TicketPriceView {
  ticket_type_id: string; // UUID
  ticket_name: string;
  event_id: string; // UUID
  base_price: number;
  profile_type_id: number;
  profile_name: string;
  final_price: number; // Le prix calculé automatiquement
  rule_type?: 'percentage' | 'minus_amount' | 'fixed_price';
  rule_value?: number;
}

// --- COMMANDES ---
export interface Order {
  id: string; // UUID
  user_id: string; // UUID
  total_amount: number;
  status: 'paid' | 'cancelled' | 'pending';
  created_at: string;
}

export interface Ticket {
  id: string; // UUID
  order_id: string;
  event_id: string;
  ticket_type_id: string;
  qr_code_hash: string;
  holder_name: string;
  final_price: number;
  status: 'valid' | 'used' | 'refunded' | 'cancelled';
}
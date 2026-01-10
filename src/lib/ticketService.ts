import { supabase } from './supabase';

export const purchaseTicket = async (event: any, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        { 
          user_id: userId,
          event_title: event.title,
          event_date: event.date,
          event_location: event.location,
          event_image: event.image_url,
          price: event.price,
          qr_code: `TKT-${Math.random().toString(36).toUpperCase().substring(2, 10)}` // Génère un code unique temporaire
        }
      ])
      .select();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error("Erreur d'achat:", error);
    return { error, success: false };
  }
};
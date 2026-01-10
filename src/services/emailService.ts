import { supabase } from '../supabaseClient';

/**
 * Envoie les données du formulaire de contact à la Edge Function de Supabase
 */
export const sendContactEmail = async (name: string, email: string, message: string) => {
  const { data, error } = await supabase.functions.invoke('contact-email', {
    body: { name, email, message },
  });

  if (error) {
    console.error("Erreur technique lors de l'appel à la fonction :", error);
    throw new Error("Désolé, l'envoi a échoué. Réessaie plus tard.");
  }

  return data;
};
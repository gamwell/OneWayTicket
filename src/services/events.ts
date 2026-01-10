import { supabase } from "@/lib/supabaseClient";
import { getEventImage } from "@/utils/eventImages";

/**
 * Normalise le texte pour la sélection d'image (enlève accents et majuscules)
 */
const normalizeText = (text: string) =>
  text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "default";

/**
 * Fonction de création d'événement mise à jour
 */
export async function createEvent(values: {
  title: string;
  description: string; // ✅ AJOUTÉ
  category: string;
  date: string;
  location: string;
  price: number;
}) {
  // Normalisation pour correspondre aux clés du mapping
  const normalizedCat = normalizeText(values.category);
  
  // On récupère une image automatiquement selon la catégorie
  const imageUrl = getEventImage(normalizedCat);

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: values.title,
      description: values.description, // ✅ AJOUTÉ
      category: values.category,
      date: values.date,
      location: values.location,
      price: values.price,
      image_url: imageUrl
    })
    .select()
    .single();

  if (error) {
    console.error("Erreur lors de la création de l'événement :", error.message);
    throw error;
  }

  return data;
}
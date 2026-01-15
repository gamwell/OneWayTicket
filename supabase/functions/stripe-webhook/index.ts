// Chemin: supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Fonction stripe-webhook démarrée")

serve(async (req) => {
  try {
    // 1. Récupération des secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // On utilise la clé admin qu'on a définie tout à l'heure
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!

    // 2. Création du client Admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Récupérer les données envoyées par Stripe
    const payload = await req.json()
    
    // Log pour voir ce que Stripe envoie (visible dans le dashboard Supabase)
    console.log("Événement Stripe reçu :", payload.type)

    // --- LOGIQUE METIER (Exemple: Sauvegarder l'event) ---
    const { error } = await supabase
      .from('audit_logs') 
      .insert({ 
        message: `Stripe Event: ${payload.type}`, 
        details: payload 
      })

    if (error) {
        console.error("Erreur insertion DB:", error)
        throw error
    }

    // 4. Réponse 200 OK (Important pour que Stripe sache que c'est reçu)
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    // En cas d'erreur, on renvoie 400 pour que Stripe réessaie plus tard si besoin
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
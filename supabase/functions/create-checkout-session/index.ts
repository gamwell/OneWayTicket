import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Stripe } from "https://esm.sh/stripe@14.21.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Gérer les requêtes OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Initialiser Stripe avec la clé secrète
    // Assurez-vous que STRIPE_SECRET_KEY est bien dans vos Secrets Supabase
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // 3. Récupérer les données envoyées par le React
    const { ticketTypeIds, quantities, successUrl, cancelUrl } = await req.json()

    // 4. Validation basique
    if (!ticketTypeIds || !quantities || ticketTypeIds.length !== quantities.length) {
      throw new Error('Données invalides : ticketTypeIds et quantities doivent correspondre.')
    }

    // --- 🚨 LA CORRECTION STRIPE V2 ICI 🚨 ---
    // On crée un "Client Test" pour satisfaire la nouvelle règle de Stripe V2
    // Dans une version avancée, vous passeriez l'email de l'utilisateur ici.
    const customer = await stripe.customers.create({
      email: 'client_test@example.com', 
      name: 'Client Test OneWay',
    });
    // -----------------------------------------

    // 5. Construire la liste des articles (Line Items)
    const line_items = ticketTypeIds.map((id: string, index: number) => ({
      price: id, // C'est ici qu'on met l'ID "price_..."
      quantity: quantities[index],
    }))

    console.log("Création session pour :", line_items)

    // 6. Créer la session de paiement AVEC le client
    const session = await stripe.checkout.sessions.create({
      customer: customer.id, // <--- AJOUT OBLIGATOIRE POUR V2
      line_items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    // 7. Renvoyer l'URL au React
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    // Gestion propre des erreurs pour le React
    console.error("Erreur Edge Function:", error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // On renvoie 400 pour que le client puisse lire le JSON
      }
    )
  }
})
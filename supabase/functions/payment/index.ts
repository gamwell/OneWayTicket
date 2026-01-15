import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Gestion du CORS (Indispensable pour localhost)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) throw new Error("Clé Stripe manquante dans les secrets");

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 2. Récupérer les infos envoyées par ton panier
    const { amount, userId, ticketItems } = await req.json();

    if (!amount || !userId) {
      throw new Error("Montant ou ID utilisateur manquant");
    }

    console.log(`🚀 Création du paiement de ${amount}€ pour l'utilisateur ${userId}`);

    // 3. Créer le PaymentIntent avec les METADATA
    // Ces métadonnées seront lues par ton Webhook pour créer les billets
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Conversion en centimes
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: userId,
        // On transforme la liste des billets en texte pour Stripe
        ticket_type_ids: ticketItems.map((item: any) => item.id).join(','),
        quantities: ticketItems.map((item: any) => item.quantity || 1).join(','),
        event_id: ticketItems[0]?.event_id || "" // ID du premier événement
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error("❌ Erreur Backend:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
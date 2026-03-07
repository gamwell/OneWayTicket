import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Stripe } from "https://esm.sh/stripe@14.21.0?target=deno";

// 1. FIX ERREUR 401 : On dit à Supabase de ne pas exiger de jeton utilisateur (Auth JWT)
// car c'est Stripe (un robot externe) qui appelle la fonction.
export const config = {
  verifyJWT: false,
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// 2. CORRECTION VARIABLE : Votre secret s'appelle STRIPE_WEBHOOK_SECRET dans Supabase
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature || !endpointSecret) {
    console.error("❌ Signature ou Secret manquant");
    return new Response('Signature manquante', { status: 400 });
  }

  const body = await req.text();
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
  } catch (err) {
    console.error(`❌ Erreur de signature Stripe: ${err.message}`);
    return new Response(`Erreur de signature: ${err.message}`, { status: 400 });
  }

  // Log pour voir ce qui arrive dans les logs Supabase
  console.log(`🔔 Événement reçu : ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Récupération des données cachées envoyées lors du paiement
    const { user_id, event_id, ticket_type_id } = session.metadata || {};

    if (!user_id || !event_id) {
      console.error("❌ Métadonnées manquantes dans la session Stripe", session.metadata);
      return new Response('Métadonnées user_id ou event_id manquantes', { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`🎟️ Création du ticket pour l'utilisateur ${user_id}...`);

    // ✅ Insertion dans votre table "tickets"
    const { error } = await supabaseAdmin
      .from('tickets')
      .insert({
        user_id: user_id,
        event_id: event_id,
        ticket_type_id: ticket_type_id || null,
        status: 'valid',
        payment_intent: session.payment_intent,
        qr_code: crypto.randomUUID(), // Génère l'identifiant unique pour le QR Code
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Erreur d\'insertion Supabase:', error.message);
      return new Response('Erreur insertion ticket', { status: 500 });
    }

    console.log("✅ Ticket créé avec succès !");
  }

  return new Response(JSON.stringify({ received: true }), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Stripe } from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature || !endpointSecret) return new Response('Signature manquante', { status: 400 });

  const body = await req.text();
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
  } catch (err) {
    return new Response(`Erreur de signature: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, event_id, ticket_type_id } = session.metadata || {};

    if (!user_id || !event_id) {
      return new Response('Métadonnées user_id ou event_id manquantes', { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ✅ Insertion conforme à votre table "tickets"
    const { error } = await supabaseAdmin
      .from('tickets')
      .insert({
        user_id: user_id,
        event_id: event_id,
        ticket_type_id: ticket_type_id || null, // Utilise ticket_types si présent
        status: 'valid',
        payment_intent: session.payment_intent,
        qr_code: crypto.randomUUID(), // Génère un UUID pour le scanneur
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Erreur Supabase:', error.message);
      return new Response('Erreur insertion ticket', { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Stripe } from "https://esm.sh/stripe@14.21.0?target=deno";

export const config = {
  verifyJWT: false,
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature || !endpointSecret) return new Response('Signature manquante', { status: 400 });

  const body = await req.text();
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
  } catch (err) {
    return new Response(`Erreur signature: ${err.message}`, { status: 400 });
  }

  console.log(`🔔 Événement reçu : ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, event_id } = session.metadata || {};

    console.log("📦 Metadata extraites :", { user_id, event_id });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ✅ Insertion simplifiée pour éviter les erreurs de colonnes manquantes
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert({
        user_id: user_id,
        event_id: event_id,
        status: 'valid',
        payment_intent: session.payment_intent || session.id, // Fallback sur session.id si payment_intent est null
        qr_code: crypto.randomUUID(),
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('❌ ERREUR SUPABASE :', error.message);
      console.error('Détails de l\'erreur :', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log("✅ TICKET CRÉÉ DANS LA BASE !", data);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
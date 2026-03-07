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
  if (!signature || !endpointSecret) {
    return new Response('Signature manquante', { status: 400 });
  }

  const body = await req.text();
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
  } catch (err) {
    console.error(`❌ Erreur signature: ${err.message}`);
    return new Response(`Erreur signature: ${err.message}`, { status: 400 });
  }

  console.log(`🔔 Événement reçu : ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, event_id, ticket_type_id, quantity } = session.metadata || {};

    console.log("📦 Metadata extraites :", { user_id, event_id, ticket_type_id, quantity });

    if (!user_id || !event_id) {
      console.error("❌ Metadata manquantes : user_id ou event_id absent");
      return new Response("Metadata manquantes", { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Prix payé en centimes → euros
    const finalPrice = session.amount_total ? session.amount_total / 100 : 0;
    const nbTickets = parseInt(quantity || "1", 10);

    // Créer un billet par quantité achetée
    const ticketsToInsert = Array.from({ length: nbTickets }, () => ({
      user_id,
      event_id,
      ticket_type_id: ticket_type_id || null,
      status: 'valid',
      qr_code_hash: crypto.randomUUID(),
      final_price: finalPrice / nbTickets,
      created_at: new Date().toISOString(),
    }));

    console.log(`🎟️ Insertion de ${nbTickets} billet(s)...`);

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert(ticketsToInsert)
      .select();

    if (error) {
      console.error('❌ ERREUR SUPABASE :', error.message, error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log(`✅ ${data.length} TICKET(S) CRÉÉ(S) !`, data);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

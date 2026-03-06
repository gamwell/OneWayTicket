import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      reservationId, 
      email, 
      quantity, 
      priceInCents, 
      baseUrl,
      userId,    
      eventId,   
      eventName 
    } = await req.json();

    if (!email || !priceInCents || !baseUrl || !userId || !eventId) {
      throw new Error("Champs obligatoires manquants pour Stripe.");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: quantity || 1,
          price_data: {
            currency: "eur",
            unit_amount: priceInCents,
            product_data: {
              name: eventName || "Billet OneWayTicket",
              description: `Réservation #${reservationId || 'En cours'}`,
            },
          },
        },
      ],
      // ✅ Redirection vers la route exacte définie dans App.tsx
      success_url: `${baseUrl}/confirmation`,
      cancel_url: `${baseUrl}/cart`,
      
      metadata: {
        reservation_id: reservationId || `CMD-${Date.now()}`,
        user_id: userId,     
        event_id: eventId,   
        quantity: String(quantity || 1),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
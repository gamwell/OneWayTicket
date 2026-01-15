import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "npm:stripe@14.16.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  try {
    const { ticketTypeIds, quantities, successUrl, cancelUrl, user_id } =
      await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
      });
    }

    if (!ticketTypeIds || ticketTypeIds.length === 0) {
      return new Response(JSON.stringify({ error: "Missing ticketTypeIds" }), {
        status: 400,
      });
    }

    // ⚠️ Tu dois avoir un price_id Stripe par ticket_type_id
    // Exemple : price_123, price_456
    const line_items = ticketTypeIds.map((id, index) => ({
      price: id, // id = price_id Stripe
      quantity: quantities[index] || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,

      metadata: {
        user_id,
        ticket_type_ids: ticketTypeIds.join(","),
      },

      customer_creation: "always",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  ticketTypeIds: string[];
  quantities: number[];
  successUrl: string;
  cancelUrl: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") || "" },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { ticketTypeIds, quantities, successUrl, cancelUrl }: CheckoutRequest =
      await req.json();

    if (
      !ticketTypeIds ||
      !quantities ||
      ticketTypeIds.length !== quantities.length
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid request data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: ticketTypes, error: ticketError } = await supabaseClient
      .from("ticket_types")
      .select("*, events:event_id(titre)")
      .in("id", ticketTypeIds);

    if (ticketError || !ticketTypes || ticketTypes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Ticket types not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-12-18.acacia",
    });

    const lineItems = ticketTypeIds.map((id, index) => {
      const ticketType = ticketTypes.find((t) => t.id === id);
      if (!ticketType) throw new Error(`Ticket type ${id} not found`);

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${ticketType.events.titre} - ${ticketType.nom}`,
            description: ticketType.description || undefined,
          },
          unit_amount: Math.round(parseFloat(ticketType.prix) * 100),
        },
        quantity: quantities[index],
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        ticket_type_ids: ticketTypeIds.join(","),
        quantities: quantities.join(","),
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
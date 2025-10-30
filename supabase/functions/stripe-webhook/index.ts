import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-12-18.acacia",
    });

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No signature provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (!metadata?.user_id || !metadata?.ticket_type_ids) {
          console.error("Missing metadata in session");
          break;
        }

        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .insert({
            user_id: metadata.user_id,
            montant: (session.amount_total || 0) / 100,
            devise: session.currency?.toUpperCase() || "EUR",
            statut: "completed",
            stripe_payment_id: session.payment_intent as string,
            stripe_session_id: session.id,
            methode_paiement: "card",
          })
          .select()
          .single();

        if (paymentError) {
          console.error("Error creating payment:", paymentError);
          break;
        }

        const ticketTypeIds = metadata.ticket_type_ids.split(",");
        const quantities = metadata.quantities.split(",").map(Number);
        const createdTicketIds: string[] = [];

        for (let i = 0; i < ticketTypeIds.length; i++) {
          const ticketTypeId = ticketTypeIds[i];
          const quantity = quantities[i];

          for (let j = 0; j < quantity; j++) {
            const { data: ticket, error: ticketError } = await supabase
              .from("tickets")
              .insert({
                user_id: metadata.user_id,
                type_billet_id: ticketTypeId,
                statut: "valid",
              })
              .select()
              .single();

            if (ticketError) {
              console.error("Error creating ticket:", ticketError);
            } else if (ticket) {
              createdTicketIds.push(ticket.id);
            }
          }
        }

        const { error: linkError } = await supabase
          .from("payment_tickets")
          .insert(
            ticketTypeIds.map((typeId: string) => ({
              payment_id: payment.id,
              ticket_type_id: typeId,
            }))
          );

        if (linkError) {
          console.error("Error linking tickets to payment:", linkError);
        }

        if (createdTicketIds.length > 0) {
          try {
            const emailResponse = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-ticket-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify({
                  userId: metadata.user_id,
                  paymentId: payment.id,
                  ticketIds: createdTicketIds,
                }),
              }
            );

            if (!emailResponse.ok) {
              console.error("Error sending ticket email:", await emailResponse.text());
            } else {
              console.log("Ticket email sent successfully");
            }
          } catch (emailError) {
            console.error("Error calling send-ticket-email function:", emailError);
          }
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Session expired: ${session.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

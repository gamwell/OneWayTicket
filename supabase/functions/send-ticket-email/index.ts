import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  userId: string;
  paymentId: string;
  ticketIds: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { userId, paymentId, ticketIds }: EmailRequest = await req.json();

    if (!userId || !paymentId || !ticketIds || ticketIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, nom, prenom")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select(`
        id,
        code_qr,
        date_achat,
        ticket_types:type_billet_id (
          nom,
          prix,
          events:event_id (
            titre,
            date_debut,
            lieu
          )
        )
      `)
      .in("id", ticketIds);

    if (ticketsError || !tickets || tickets.length === 0) {
      return new Response(
        JSON.stringify({ error: "Tickets not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("montant, devise")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const eventName = tickets[0].ticket_types.events.titre;
    const eventDate = new Date(tickets[0].ticket_types.events.date_debut).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const eventLocation = tickets[0].ticket_types.events.lieu;

    const ticketsHtml = tickets.map(ticket => `
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h3 style="margin: 0 0 8px 0; color: #111827;">${ticket.ticket_types.nom}</h3>
        <p style="margin: 4px 0; color: #6b7280;">Code: <strong>${ticket.code_qr}</strong></p>
        <p style="margin: 4px 0; color: #6b7280;">Prix: ${parseFloat(ticket.ticket_types.prix)}€</p>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">ONEWAYTICKET</h1>
              <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">Confirmation d'achat</p>
            </div>
            
            <div style="padding: 40px 20px;">
              <h2 style="color: #111827; margin: 0 0 16px 0;">Bonjour ${user.prenom} ${user.nom},</h2>
              
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px;">
                Merci pour votre achat ! Voici la confirmation de vos billets pour :
              </p>
              
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0;">
                <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 20px;">${eventName}</h3>
                <p style="margin: 4px 0; color: #1e40af;">📅 ${eventDate}</p>
                <p style="margin: 4px 0; color: #1e40af;">📍 ${eventLocation}</p>
              </div>
              
              <h3 style="color: #111827; margin: 32px 0 16px 0;">Vos billets :</h3>
              ${ticketsHtml}
              
              <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 32px 0;">
                <p style="margin: 0; color: #92400e;">💡 <strong>Important :</strong> Présentez vos codes QR à l'entrée de l'événement. Vous pouvez les retrouver dans votre espace "Mes billets" sur ONEWAYTICKET.</p>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
                <p style="margin: 0 0 8px 0; color: #6b7280;">Montant total payé : <strong>${payment.montant}€</strong></p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Référence de paiement : ${paymentId.substring(0, 8)}</p>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                Besoin d'aide ? Contactez-nous à <a href="mailto:support@onewayticket.com" style="color: #3b82f6; text-decoration: none;">support@onewayticket.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2024 ONEWAYTICKET. Tous droits réservés.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "ONEWAYTICKET <onboarding@resend.dev>",
      to: [user.email],
      subject: `Vos billets pour ${eventName}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Error sending email:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-ticket-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
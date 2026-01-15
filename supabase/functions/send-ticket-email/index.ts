import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";

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
  // 1. Gestion du CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    const resend = new Resend(RESEND_API_KEY);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { userId, paymentId, ticketIds }: EmailRequest = await req.json();

    if (!userId || !paymentId || !ticketIds?.length) {
      return new Response(JSON.stringify({ error: "Champs requis manquants" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Récupération des infos utilisateur (depuis la table 'profiles' ou 'users' selon votre DB)
    // Note: 'auth.users' n'est pas accessible directement via createClient facilement, 
    // on suppose que vous avez une table publique 'profiles' ou 'users'
    const { data: user, error: userError } = await supabase
      .from("profiles") // Vérifiez si votre table s'appelle 'profiles' ou 'users'
      .select("email, nom, prenom")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("User error:", userError);
      throw new Error("Utilisateur non trouvé");
    }

    // 3. Récupération des billets avec jointures exactes
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select(`
        id,
        statut,
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
      console.error("Tickets error:", ticketsError);
      throw new Error("Billets non trouvés");
    }

    // 4. Récupération du paiement
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("montant, devise")
      .eq("id", paymentId)
      .single();

    // Extraction des infos de l'événement (sécurisé)
    const firstTicket = tickets[0].ticket_types;
    const event = firstTicket?.events;
    const eventName = event?.titre || "Événement";
    const eventLocation = event?.lieu || "Lieu à confirmer";
    
    const eventDate = event?.date_debut 
      ? new Date(event.date_debut).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : "Date à confirmer";

    // 5. Construction du HTML des billets
    const ticketsHtml = tickets.map(t => `
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0; color: #111827; font-size: 18px;">${t.ticket_types.nom}</h3>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">ID: ${t.id}</p>
          </div>
          <div style="text-align: right;">
            <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Valide</span>
          </div>
        </div>
      </div>
    `).join('');

    // 6. Template HTML Complet
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; color: #374151; background-color: #f3f4f6; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #1a0525; padding: 40px; text-align: center;">
              <h1 style="color: #fbbf24; margin: 0; font-style: italic;">ONEWAYTICKET</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="margin-top: 0;">Félicitations ${user.prenom} !</h2>
              <p>Votre commande est confirmée. Préparez-vous pour une expérience inoubliable.</p>
              
              <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0; color: #92400e;">${eventName}</h3>
                <p style="margin: 10px 0 0 0;">📅 ${eventDate}<br>📍 ${eventLocation}</p>
              </div>

              <h3>Vos Billets</h3>
              ${ticketsHtml}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #6b7280;">
                <p>Montant total : ${payment?.montant || '--'} ${payment?.devise || '€'}</p>
                <p>Retrouvez vos QR Codes dans votre espace client sur notre application.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // 7. Envoi via Resend
    const { data, error: sendError } = await resend.emails.send({
      from: "ONEWAYTICKET <onboarding@resend.dev>", // Une fois votre domaine validé, changez ceci
      to: [user.email],
      subject: `Confirmation : Vos billets pour ${eventName}`,
      html: htmlContent,
    });

    if (sendError) throw sendError;

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("💥 Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
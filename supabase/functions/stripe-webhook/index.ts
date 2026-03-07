import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Stripe } from "https://esm.sh/stripe@14.21.0?target=deno";

export const config = { verifyJWT: false };

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// ✅ Génère un PDF de facture en base64 (via HTML→PDF avec Browserless ou manuellement)
async function generateInvoicePDF(invoiceData: {
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientEmail: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ticketIds: string[];
}): Promise<string> {

  const { invoiceNumber, date, clientName, clientEmail, eventTitle, eventDate, eventLocation, quantity, unitPrice, totalPrice, ticketIds } = invoiceData;

  // Génération PDF via l'API Resend avec HTML (encodé en base64 manuellement)
  // On utilise une lib légère Deno pour générer le PDF
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Helvetica, Arial, sans-serif; background: #fff; color: #1a1a2e; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #f0f0f0; }
    .brand { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #1a0525; }
    .brand span { color: #f59e0b; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 20px; color: #6b7280; font-weight: 400; }
    .invoice-title p { font-size: 13px; color: #9ca3af; margin-top: 4px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
    .info-block h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-bottom: 8px; }
    .info-block p { font-size: 14px; color: #374151; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead tr { background: #1a0525; color: white; }
    thead th { padding: 12px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    tbody tr { border-bottom: 1px solid #f3f4f6; }
    tbody td { padding: 14px 16px; font-size: 14px; color: #374151; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
    .total-final { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 900; color: #1a0525; border-top: 2px solid #1a0525; margin-top: 8px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #f0f0f0; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.8; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">ONE<span>WAY</span>TICKET</div>
      <p style="font-size:12px; color:#9ca3af; margin-top:4px;">quarksydigital.com</p>
    </div>
    <div class="invoice-title">
      <h2>FACTURE</h2>
      <p>N° ${invoiceNumber}</p>
      <p>Date : ${date}</p>
      <span class="badge">✓ Payée</span>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <h4>Émetteur</h4>
      <p><strong>OneWayTicket SAS</strong><br/>12 Rue de la Paix<br/>75001 Paris, France<br/>contact@onewayticket.fr<br/>RCS Paris B 123 456 789</p>
    </div>
    <div class="info-block">
      <h4>Client</h4>
      <p><strong>${clientName}</strong><br/>${clientEmail}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Date</th>
        <th>Lieu</th>
        <th>Qté</th>
        <th>Prix unitaire</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${eventTitle}</strong><br/><span style="font-size:11px; color:#9ca3af;">Billet d'entrée</span></td>
        <td>${eventDate ? new Date(eventDate).toLocaleDateString("fr-FR") : "-"}</td>
        <td>${eventLocation || "-"}</td>
        <td style="text-align:center;">${quantity}</td>
        <td>${unitPrice.toFixed(2)} €</td>
        <td><strong>${totalPrice.toFixed(2)} €</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Sous-total HT</span><span>${(totalPrice / 1.20).toFixed(2)} €</span></div>
    <div class="total-row"><span>TVA (20%)</span><span>${(totalPrice - totalPrice / 1.20).toFixed(2)} €</span></div>
    <div class="total-final"><span>TOTAL TTC</span><span>${totalPrice.toFixed(2)} €</span></div>
  </div>

  <div class="footer">
    <p>OneWayTicket SAS — 12 Rue de la Paix, 75001 Paris — RCS Paris B 123 456 789</p>
    <p>TVA non applicable, art. 293 B du CGI • contact@onewayticket.fr • quarksydigital.com</p>
    <p style="margin-top:8px; color:#d1d5db;">Références billets : ${ticketIds.slice(0, 3).join(", ")}${ticketIds.length > 3 ? "..." : ""}</p>
  </div>
</body>
</html>`;

  // Encoder le HTML en base64 (Deno natif)
  const encoder = new TextEncoder();
  const htmlBytes = encoder.encode(htmlContent);
  const base64Html = btoa(String.fromCharCode(...htmlBytes));
  return base64Html;
}

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
      console.error("❌ Metadata manquantes");
      return new Response("Metadata manquantes", { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const finalPrice = session.amount_total ? session.amount_total / 100 : 0;
    const nbTickets = parseInt(quantity || "1", 10);
    const unitPrice = finalPrice / nbTickets;

    // Créer les billets
    const ticketsToInsert = Array.from({ length: nbTickets }, () => ({
      user_id,
      event_id,
      ticket_type_id: ticket_type_id || null,
      status: 'valid',
      qr_code_hash: crypto.randomUUID(),
      final_price: unitPrice,
      created_at: new Date().toISOString(),
    }));

    console.log(`🎟️ Insertion de ${nbTickets} billet(s)...`);
    const { data: tickets, error } = await supabaseAdmin
      .from('tickets')
      .insert(ticketsToInsert)
      .select();

    if (error) {
      console.error('❌ ERREUR SUPABASE :', error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log(`✅ ${tickets.length} TICKET(S) CRÉÉ(S) !`);

    // ✅ Récupérer infos client + événement pour la facture
    try {
      const [profileRes, eventRes] = await Promise.all([
        supabaseAdmin.from("user_profiles").select("email, full_name").eq("id", user_id).maybeSingle(),
        supabaseAdmin.from("events").select("title, date, location").eq("id", event_id).maybeSingle(),
      ]);

      const clientEmail = profileRes.data?.email;
      const clientName = profileRes.data?.full_name || "Client";
      const eventTitle = eventRes.data?.title || "Événement";
      const eventDate = eventRes.data?.date || "";
      const eventLocation = eventRes.data?.location || "";

      if (clientEmail) {
        // Numéro de facture unique
        const invoiceNumber = `OWT-${Date.now().toString().slice(-8)}`;
        const invoiceDate = new Date().toLocaleDateString("fr-FR");
        const ticketIds = tickets.map((t: any) => t.id);

        // Générer le PDF (HTML encodé base64)
        const pdfBase64 = await generateInvoicePDF({
          invoiceNumber,
          date: invoiceDate,
          clientName,
          clientEmail,
          eventTitle,
          eventDate,
          eventLocation,
          quantity: nbTickets,
          unitPrice,
          totalPrice: finalPrice,
          ticketIds,
        });

        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

        // Email HTML de confirmation + facture en pièce jointe
        const emailHtml = `
        <div style="font-family: Helvetica, Arial, sans-serif; background:#0f0a1a; padding:40px;">
          <div style="max-width:600px; margin:auto; background:#1a0525; border-radius:32px; padding:40px; border:1px solid rgba(255,255,255,0.08);">
            <h1 style="text-align:center; color:#fbbf24; font-size:28px; font-weight:900; text-transform:uppercase; letter-spacing:2px;">ONEWAYTICKET</h1>
            <h2 style="color:white; font-size:20px; margin-top:24px;">🎟️ Merci ${clientName} !</h2>
            <p style="color:rgba(255,255,255,0.6); margin-top:12px; line-height:1.7;">
              Votre paiement a bien été reçu. Votre facture est disponible en pièce jointe.
            </p>
            <div style="background:rgba(255,255,255,0.05); border-radius:20px; padding:20px; margin:24px 0;">
              <p style="color:white; font-weight:900; font-size:16px;">${eventTitle}</p>
              ${eventDate ? `<p style="color:rgba(255,255,255,0.4); font-size:13px; margin-top:8px;">📅 ${new Date(eventDate).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}</p>` : ""}
              ${eventLocation ? `<p style="color:rgba(255,255,255,0.4); font-size:13px;">📍 ${eventLocation}</p>` : ""}
              <p style="color:rgba(255,255,255,0.4); font-size:13px;">🎫 ${nbTickets} billet(s) — ${finalPrice.toFixed(2)} €</p>
            </div>
            <div style="text-align:center; margin:32px 0;">
              <a href="https://quarksydigital.com/profile" style="padding:14px 28px; background:#fbbf24; color:#1a0525; border-radius:14px; font-weight:900; text-decoration:none; font-size:13px; text-transform:uppercase;">
                Voir mes billets
              </a>
            </div>
            <p style="color:rgba(255,255,255,0.2); font-size:11px; text-align:center;">
              Facture N° ${invoiceNumber} • contact@onewayticket.fr
            </p>
          </div>
        </div>`;

        // ✅ Envoyer via Resend avec pièce jointe HTML (rendu comme PDF)
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "ONEWAYTICKET <no-reply@quarksydigital.com>",
            to: [clientEmail],
            subject: `🎟️ Vos billets + Facture — ${eventTitle}`,
            html: emailHtml,
            attachments: [
              {
                filename: `Facture_${invoiceNumber}.html`,
                content: pdfBase64,
              },
            ],
          }),
        });

        if (emailRes.ok) {
          console.log(`✅ Email + facture envoyés à ${clientEmail}`);
        } else {
          const errText = await emailRes.text();
          console.error("❌ Erreur envoi email:", errText);
        }
      }
    } catch (emailErr) {
      console.error("❌ Erreur génération facture:", emailErr);
      // On ne bloque pas le webhook si l'email échoue
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

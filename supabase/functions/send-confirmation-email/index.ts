import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY manquante");

    const { email, name, reservationId, quantity, eventTitle, eventDate, eventLocation, qrCodeUrl } = await req.json();

    if (!email || !name) {
      return new Response(JSON.stringify({ error: "Champs requis manquants" }), { status: 400, headers: corsHeaders });
    }

    const html = `
    <div style="font-family: Helvetica, Arial, sans-serif; background:#0f0a1a; padding:40px;">
      <div style="max-width:600px; margin:auto; background:#1a0525; border-radius:32px; padding:40px; border:1px solid rgba(255,255,255,0.08);">
        
        <h1 style="text-align:center; color:#fbbf24; font-size:28px; font-weight:900; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">
          ONEWAYTICKET
        </h1>
        <p style="text-align:center; color:rgba(255,255,255,0.3); font-size:12px; text-transform:uppercase; letter-spacing:3px; margin-bottom:32px;">
          Confirmation de billet
        </p>

        <h2 style="color:white; font-size:22px; font-weight:900; margin-bottom:16px;">
          🎟️ Bonjour ${name},
        </h2>
        <p style="color:rgba(255,255,255,0.6); font-size:15px; line-height:1.6;">
          Votre billet est confirmé ! Retrouvez ci-dessous le récapitulatif de votre réservation.
        </p>

        <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:24px; margin:24px 0;">
          ${eventTitle ? `<p style="color:white; font-size:18px; font-weight:900; text-transform:uppercase; margin:0 0 12px;">${eventTitle}</p>` : ""}
          ${eventDate ? `<p style="color:rgba(255,255,255,0.5); font-size:13px; margin:4px 0;">📅 ${new Date(eventDate).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>` : ""}
          ${eventLocation ? `<p style="color:rgba(255,255,255,0.5); font-size:13px; margin:4px 0;">📍 ${eventLocation}</p>` : ""}
          <p style="color:rgba(255,255,255,0.5); font-size:13px; margin:4px 0;">🎫 Quantité : <strong style="color:white;">${quantity || 1}</strong></p>
          ${reservationId ? `<p style="color:rgba(255,255,255,0.3); font-size:11px; margin:12px 0 0; font-family:monospace;">Réf : #${reservationId}</p>` : ""}
        </div>

        ${qrCodeUrl ? `
        <div style="text-align:center; margin:24px 0;">
          <p style="color:rgba(255,255,255,0.5); font-size:12px; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">Votre QR Code d'entrée</p>
          <img src="${qrCodeUrl}" alt="QR Code" style="width:180px; height:180px; border-radius:16px; border:2px solid rgba(251,191,36,0.3);" />
        </div>
        ` : ""}

        <div style="text-align:center; margin:32px 0 16px;">
          <a href="https://quarksydigital.com/profile" style="padding:16px 32px; background:#fbbf24; color:#1a0525; border-radius:16px; font-weight:900; text-decoration:none; font-size:14px; text-transform:uppercase; letter-spacing:1px;">
            Voir mes billets
          </a>
        </div>

        <p style="color:rgba(255,255,255,0.2); font-size:11px; text-align:center; margin-top:24px;">
          Présentez votre QR code à l'entrée de l'événement.<br/>
          Contact : contact@onewayticket.fr
        </p>
      </div>
    </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ONEWAYTICKET <no-reply@quarksydigital.com>",
        to: [email],
        subject: `🎟️ Votre billet ${eventTitle ? `— ${eventTitle}` : "est confirmé"} !`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Erreur send-confirmation-email:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

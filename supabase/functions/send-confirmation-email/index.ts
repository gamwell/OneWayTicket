import { serve } from "https://deno.land/std/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM")!;

serve(async (req) => {
  try {
    const { email, name, reservationId, quantity } = await req.json();

    if (!email || !name || !reservationId || !quantity) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const html = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>🎟️ Confirmation de réservation</h2>
        <p>Bonjour <strong>${name}</strong>,</p>
        <p>Votre réservation <strong>#${reservationId}</strong> est confirmée.</p>
        <p>Nombre de tickets : <strong>${quantity}</strong></p>
        <p>Merci pour votre confiance. Présentez votre QR code à l’entrée.</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Billetterie <${EMAIL_FROM}>`,
        to: email,
        subject: "Confirmation de votre réservation",
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erreur email:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
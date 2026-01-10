import { serve } from "https://deno.land/std/http/server.ts";
import { Resend } from "npm:resend";

// Initialisation de Resend avec la clé API (stockée en secret Supabase)
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  try {
    // Données envoyées depuis l'application
    const { email, subject, message } = await req.json();

    // Sécurité minimale
    if (!email || !message) {
      return new Response(
        JSON.stringify({ error: "Email et message obligatoires" }),
        { status: 400 }
      );
    }

    // Envoi de l'email au service client
    const data = await resend.emails.send({
      from: "Contact <contact@quarksydigital.com>",
      to: [
        "service.client@quarksydigital.com",
        "support@quarksydigital.com"
      ],
      reply_to: email,
      subject: subject || "Message depuis l’application",
      html: `
        <h3>Nouveau message depuis l’application</h3>
        <p><strong>Email du client :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});

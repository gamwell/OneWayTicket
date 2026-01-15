import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "npm:resend@4.0.0"

// 1. Définition des headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 2. Gestion de la requête de pré-vérification (OPTIONS)
  // Indispensable pour éviter l'erreur "Blocked by CORS policy"
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    if (!RESEND_API_KEY) {
      throw new Error("Clé RESEND_API_KEY manquante dans les secrets")
    }

    const resend = new Resend(RESEND_API_KEY)
    
    // 3. Extraction et vérification des données
    const { email, subject, message } = await req.json()

    if (!email || !message) {
      return new Response(
        JSON.stringify({ error: "Email et message obligatoires" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 4. Envoi de l'email via Resend
    // Note: L'adresse 'from' doit être validée sur votre compte Resend
    const { data, error: sendError } = await resend.emails.send({
      from: "OneWayTicket Support <onboarding@resend.dev>", // Utilisez onboarding@resend.dev pour les tests
      to: ["service.client@quarksydigital.com"],
      reply_to: email,
      subject: subject || "Nouveau message de contact",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a;">
          <h2 style="color: #1a0525;">Nouveau message reçu</h2>
          <hr />
          <p><strong>De :</strong> ${email}</p>
          <p><strong>Sujet :</strong> ${subject || 'Non spécifié'}</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
            <p><strong>Message :</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            Cet email a été envoyé depuis le formulaire de contact de l'application.
          </p>
        </div>
      `,
    })

    if (sendError) {
      throw new Error(`Erreur Resend: ${sendError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error) {
    console.error("Critical error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Resend from "https://esm.sh/resend@3.2.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY manquante")

    const resend = new Resend(RESEND_API_KEY)

    const { record } = await req.json()
    if (!record) throw new Error("Aucun record reçu")

    const email = record.email
    const first_name = record.first_name || "Utilisateur"
    const profile_type = record.profile_type || "standard"

    if (!email) throw new Error("Email manquant")

    const isReduced = profile_type === "demandeur_emploi"

    const subject = isReduced
      ? "🎟️ Activez votre tarif réduit OneWayTicket"
      : "🎉 Bienvenue chez OneWayTicket !"

    const html = `
    <div style="font-family: Helvetica, Arial, sans-serif; background:#0f172a; padding:40px;">
      <div style="max-width:600px; margin:auto; background:#1e293b; border-radius:32px; padding:40px; border:1px solid rgba(255,255,255,0.05);">

        <h1 style="text-align:center; color:#22d3ee; font-size:32px;">
          OneWay<span style="color:white;">Ticket</span>
        </h1>

        <h2 style="color:white; margin-top:20px; font-size:26px;">
          Bonjour ${first_name} 👋
        </h2>

        <p style="color:#94a3b8; margin-top:20px;">
          ${
            isReduced
              ? "Pour activer votre tarif réduit, merci de déposer un justificatif valide dans votre espace personnel."
              : "Nous sommes ravis de vous compter parmi nos voyageurs."
          }
        </p>

        <div style="text-align:center; margin-top:30px;">
          <a href="https://onewayticket.fr/profile" style="padding:16px 32px; background:#22d3ee; color:#0f172a; border-radius:16px; font-weight:900; text-decoration:none;">
            Accéder à mon compte
          </a>
        </div>

      </div>
    </div>
    `

    const { data, error } = await resend.emails.send({
      from: "OneWayTicket <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
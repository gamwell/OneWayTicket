import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const SITE_URL = Deno.env.get("SITE_URL") || "https://onewayticket.fr"

    const { record, old_record } = await req.json()

    if (old_record && record.verification_status === old_record.verification_status) {
      return new Response(JSON.stringify({ message: "No change" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const isVerified = record.verification_status === "verified"
    const isRejected = record.verification_status === "rejected"

    if (!isVerified && !isRejected) {
      return new Response("Pending, no email sent", { status: 200 })
    }

    const themeColor = isVerified ? "#22d3ee" : "#ec4899"
    const themeRgb = isVerified ? "34, 211, 238" : "236, 72, 153"
    const title = isVerified ? "Accès Prioritaire Activé" : "Justificatif Non Valide"
    const subject = isVerified
      ? "🎉 Votre profil OneWayTicket est validé !"
      : "⚠️ Votre justificatif doit être remplacé"

    const message = isVerified
      ? `Félicitations ${record.full_name || "Utilisateur"}, votre justificatif a été approuvé.`
      : `Désolé ${record.full_name || "Utilisateur"}, votre justificatif n'a pas pu être validé.`

    const html = `
    <div style="font-family: Helvetica, Arial, sans-serif; background:#0f172a; padding:40px;">
      <div style="max-width:600px; margin:auto; background:#1e293b; border-radius:32px; padding:40px; border:1px solid rgba(255,255,255,0.05);">

        <h1 style="text-align:center; color:${themeColor}; font-size:32px;">
          OneWay<span style="color:white;">Ticket</span>
        </h1>

        <div style="text-align:center; margin-top:20px;">
          <span style="padding:8px 20px; border-radius:999px; background:rgba(${themeRgb},0.1); border:1px solid rgba(${themeRgb},0.3); color:${themeColor}; font-size:12px; font-weight:800;">
            ${isVerified ? "Profil Vérifié" : "Action Requise"}
          </span>
        </div>

        <h2 style="color:white; text-align:center; margin-top:30px; font-size:26px;">${title}</h2>

        <p style="color:#94a3b8; margin-top:20px; text-align:center;">
          ${message}
        </p>

        <div style="text-align:center; margin-top:30px;">
          <a href="${SITE_URL}/profile" style="padding:16px 32px; background:${themeColor}; color:#0f172a; border-radius:16px; font-weight:900; text-decoration:none;">
            Accéder à mon compte
          </a>
        </div>

      </div>
    </div>
    `

    const { data, error } = await resend.emails.send({
      from: "OneWayTicket <onboarding@resend.dev>",
      to: [record.email],
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
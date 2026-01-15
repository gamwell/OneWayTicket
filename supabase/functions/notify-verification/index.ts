import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion du Preflight (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://votre-site.com'
    
    // Extraction des données du Webhook Supabase
    const { record, old_record } = await req.json()

    // 1. Éviter d'envoyer un mail si le statut n'a pas changé
    if (old_record && record.verification_status === old_record.verification_status) {
      return new Response(JSON.stringify({ message: 'No status change' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    }

    // 2. Configuration visuelle selon le statut
    const isVerified = record.verification_status === 'verified'
    const isRejected = record.verification_status === 'rejected'

    // On sort de la fonction si le statut est "pending" (pas besoin d'email)
    if (!isVerified && !isRejected) {
      return new Response('Status is pending', { status: 200 })
    }

    const themeColor = isVerified ? '#22d3ee' : '#ec4899'
    const themeRgb = isVerified ? '34, 211, 238' : '236, 72, 153'
    const statusLabel = isVerified ? 'Profil Vérifié' : 'Action Requise'
    const emailTitle = isVerified ? "Accès Prioritaire Activé" : "Justificatif Non Valide"
    
    const emailMessage = isVerified
      ? `Félicitations ${record.full_name || 'Utilisateur'}, votre justificatif a été approuvé. Vous avez désormais accès à l'ensemble de nos tarifs préférentiels.`
      : `Désolé ${record.full_name || 'Utilisateur'}, votre document n'a pas pu être validé par notre équipe. Merci de soumettre une nouvelle photo lisible de votre justificatif.`

    const subject = isVerified 
      ? "✅ Votre profil OneWayTicket a été validé !" 
      : "❌ Information concernant votre profil OneWayTicket"

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #1e293b; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .header { padding: 40px; text-align: center; background: #1e293b; border-bottom: 2px solid ${themeColor}; }
        .content { padding: 40px; text-align: center; color: #f8fafc; }
        .button { display: inline-block; padding: 18px 36px; background-color: ${themeColor}; color: #0f172a !important; text-decoration: none; border-radius: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-top: 30px; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; background-color: rgba(${themeRgb}, 0.1); color: ${themeColor}; border: 1px solid rgba(${themeRgb}, 0.2); margin-bottom: 24px; letter-spacing: 2px; }
        h1 { font-style: italic; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0; font-size: 28px; }
        p { line-height: 1.6; color: #94a3b8; font-size: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: ${themeColor};">OneWay<span style="color: #ffffff;">Ticket</span></h1>
        </div>
        <div class="content">
          <div class="status-badge">${statusLabel}</div>
          <h2 style="font-size: 26px; margin-bottom: 20px; font-style: italic; text-transform: uppercase; font-weight: 900;">${emailTitle}</h2>
          <p>${emailMessage}</p>
          <a href="${SITE_URL}/profile" class="button">Accéder à mon compte</a>
        </div>
      </div>
    </body>
    </html>
    `

    // 3. Envoi de l'email
    const { data, error } = await resend.emails.send({
      from: 'OneWayTicket <onboarding@resend.dev>', // Utilisez onboarding@resend.dev par défaut
      to: [record.email],
      subject: subject,
      html: htmlTemplate,
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, id: data?.id }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }
})
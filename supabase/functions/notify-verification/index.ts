import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend"

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
// Récupération de l'URL de votre site (ex: https://monespace-owt.vercel.app)
const SITE_URL = Deno.env.get('SITE_URL') || 'https://votre-site-par-defaut.com'

serve(async (req) => {
  try {
    const { record, old_record } = await req.json()

    if (old_record && record.verification_status === old_record.verification_status) {
      return new Response('No status change', { status: 200 })
    }

    const isVerified = record.verification_status === 'verified'
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

    // LIEN DYNAMIQUE VERS LE PROFIL
    const profileLink = `${SITE_URL}/profile`

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #1e293b; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .header { padding: 40px; text-align: center; background: #1e293b; border-bottom: 2px solid ${themeColor}; }
        .content { padding: 40px; text-align: center; color: #f8fafc; }
        .footer { padding: 30px; text-align: center; color: #64748b; font-size: 11px; background: #0f172a; }
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
          
          <a href="${profileLink}" class="button">Accéder à mon compte</a>
        </div>
        <div class="footer">
          &copy; 2026 OneWayTicket Protocol. Système de Billetterie Sécurisé.<br>
          Ceci est une notification automatique.
        </div>
      </div>
    </body>
    </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'OneWayTicket <noreply@votre-domaine.com>',
      to: [record.email],
      subject: subject,
      html: htmlTemplate,
    })

    if (error) throw error
    return new Response(JSON.stringify({ message: 'Email sent', id: data?.id }), { status: 200 })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
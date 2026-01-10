import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  email: string
  first_name: string
  profile_type: 'demandeur_emploi' | 'standard'
}

serve(async (req) => {
  // Gestion du CORS pour les appels depuis le navigateur
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, first_name, profile_type }: EmailPayload = await req.json()

    // Personnalisation du contenu selon le type de profil
    let subject = "Bienvenue sur [Nom de votre plateforme]"
    let htmlContent = ""

    if (profile_type === 'demandeur_emploi') {
      subject = "Action requise : Validez votre tarif réduit sur [Nom de votre plateforme]"
      htmlContent = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>Bonjour ${first_name},</h2>
          <p>Nous sommes ravis de vous accompagner. Pour activer votre <strong>réduction de 25%</strong> sur nos services, nous avons besoin d'un justificatif en cours de validité.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px;">
            <strong>Document accepté :</strong>
            <ul>
              <li>Votre dernière Attestation de situation Pôle Emploi/France Travail (datant de moins de 3 mois).</li>
            </ul>
          </div>

          <h3>Comment faire ?</h3>
          <ol>
            <li>Connectez-vous à votre espace client.</li>
            <li>Allez dans l'onglet <strong>"Mon Profil"</strong>.</li>
            <li>Téléchargez votre document au format PDF ou Photo.</li>
          </ol>
          
          <p>Dès réception, notre équipe comptabilité validera votre accès aux tarifs réduits sous 24h.</p>
          <p>À très vite !<br>L'équipe [Nom de votre plateforme]</p>
        </div>
      `
    } else {
      // Version standard si nécessaire
      htmlContent = `<h2>Bienvenue ${first_name} !</h2><p>Heureux de vous compter parmi nous.</p>`
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Contact <onboarding@votre-domaine.com>',
        to: [email],
        subject: subject,
        html: htmlContent,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
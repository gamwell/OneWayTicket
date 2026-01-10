import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDER_EMAIL = "Quarksy Digital <contact@quarksydigital.com>";

serve(async (req) => {
  try {
    const body = await req.json()
    
    // Extraction des données envoyées par le Webhook Supabase
    const record = body.record 
    if (!record) throw new Error("Aucun enregistrement trouvé dans le payload")

    const email = record.email
    const first_name = record.first_name || "Client"
    const profile_type = record.profile_type || 'standard'

    if (!email) throw new Error("Email manquant dans le profil")

    // Préparation du contenu de l'email
    let subject = "Bienvenue chez Quarksy Digital !";
    let htmlContent = "";

    if (profile_type === 'demandeur_emploi') {
      subject = "Action requise : Validez votre tarif réduit sur Quarksy Digital";
      htmlContent = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb;">Bonjour ${first_name},</h2>
          <p>Pour activer votre <strong>réduction de 25%</strong>, nous avons besoin d'un justificatif en cours de validité.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <strong>Document accepté :</strong>
            <ul>
              <li>Dernière Attestation France Travail de moins de 3 mois.</li>
            </ul>
          </div>

          <h3>Comment faire ?</h3>
          <ol>
            <li>Connectez-vous sur <strong>quarksydigital.com</strong>.</li>
            <li>Allez dans l'onglet <strong>"Mon Profil"</strong>.</li>
            <li>Téléchargez votre justificatif.</li>
          </ol>
          
          <p>Notre équipe validera votre accès sous 24h.</p>
          <p>À très vite !<br>L'équipe <strong>Quarksy Digital</strong></p>
        </div>
      `;
    } else {
      subject = "Bienvenue chez Quarksy Digital !";
      htmlContent = `<h2>Bienvenue ${first_name} !</h2><p>Heureux de vous compter parmi nous.</p>`;
    }

    // Envoi via l'API Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [email],
        subject: subject,
        html: htmlContent,
      }),
    })

    const responseData = await res.json()

    return new Response(JSON.stringify(responseData), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    })
  }
})
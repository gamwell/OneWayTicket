import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

// Configuration des en-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion du Preflight Request (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    // ⚠️ IMPORTANT : Si votre domaine n'est pas encore validé sur Resend, 
    // utilisez "onboarding@resend.dev" sinon l'envoi échouera.
    const SENDER_EMAIL = "Quarksy Digital <onboarding@resend.dev>"; 

    if (!RESEND_API_KEY) {
      throw new Error("Clé API Resend manquante dans les secrets Supabase")
    }

    const body = await req.json()
    
    // Le Webhook de Supabase envoie les données dans body.record
    const record = body.record 
    if (!record) throw new Error("Aucun enregistrement trouvé dans le payload")

    const email = record.email
    const first_name = record.first_name || "Client"
    const profile_type = record.profile_type || 'standard'

    if (!email) throw new Error("Email manquant dans le profil")

    // Préparation du contenu
    let subject = "Bienvenue chez Quarksy Digital !";
    let htmlContent = "";

    if (profile_type === 'demandeur_emploi') {
      subject = "Action requise : Validez votre tarif réduit";
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
          <p>Connectez-vous sur votre profil pour le télécharger. Notre équipe validera votre accès sous 24h.</p>
          <p>À très vite !<br>L'équipe <strong>Quarksy Digital</strong></p>
        </div>
      `;
    } else {
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Bienvenue ${first_name} ! 🚀</h2>
          <p>Nous sommes ravis de vous compter parmi nos membres.</p>
          <p>À très bientôt sur Quarksy Digital.</p>
        </div>
      `;
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

    if (!res.ok) {
      throw new Error(`Erreur Resend: ${JSON.stringify(responseData)}`)
    }

    return new Response(JSON.stringify({ message: "Email envoyé avec succès", id: responseData.id }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })

  } catch (error) {
    console.error("Erreur critique fonction:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})
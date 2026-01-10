// supabase/functions/welcome-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { record } = await req.json() // Récupère les infos du profil créé

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Contact <votre-site@mondomaine.com>',
      to: [record.billing_email || record.email],
      subject: `Bienvenue ${record.first_name} !`,
      html: `
        <h1>Bonjour ${record.first_name},</h1>
        <p>Merci de nous avoir rejoints en tant que <strong>${record.profile_type}</strong>.</p>
        <p>N'oubliez pas de charger votre justificatif pour bénéficier de vos tarifs réduits.</p>
      `,
    }),
  })

  return new Response(JSON.stringify({ done: true }), { headers: { "Content-Type": "application/json" } })
})
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import Stripe from 'npm:stripe@^14.16.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature || !endpointSecret) {
    return new Response('Configuration manquante', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const userId = session.metadata?.user_id
      const ticketTypeIds = session.metadata?.ticket_type_ids?.split(',') || []
      const customerEmail = session.customer_details?.email

      // 1. Récupération des infos de l'événement
      const { data: ticketTypeData } = await supabase
        .from('ticket_types')
        .select('event_id, name, events(title, date, location)')
        .eq('id', ticketTypeIds[0])
        .single()

      if (!ticketTypeData) throw new Error("Événement introuvable")

      // 2. Création du billet en base
      const qrCodeUUID = crypto.randomUUID()
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          user_id: userId,
          event_id: ticketTypeData.event_id,
          status: 'valid',
          final_price: session.amount_total ? session.amount_total / 100 : 0,
          qr_code: qrCodeUUID
        }])
        .select()
        .single()

      if (ticketError) throw ticketError

      // 3. ENVOI DE L'EMAIL VIA RESEND
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeUUID}`

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'OneWayTicket <onboarding@resend.dev>', // Remplace par ton domaine plus tard
          to: [customerEmail],
          subject: `🎟️ Ton billet pour ${ticketTypeData.events.title}`,
          html: `
            <div style="font-family: sans-serif; background-color: #1a0525; color: white; padding: 40px; border-radius: 20px; text-align: center;">
              <h1 style="color: #fbbf24; text-transform: uppercase; font-style: italic;">OneWayTicket</h1>
              <p style="font-size: 18px;">Merci pour votre commande ! Voici votre accès officiel.</p>
              
              <div style="background: white; padding: 20px; display: inline-block; border-radius: 15px; margin: 20px 0;">
                <img src="${qrImageUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
                <p style="color: black; font-weight: bold; margin-top: 10px; font-size: 12px;">${ticket.id}</p>
              </div>

              <div style="text-align: left; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-top: 20px;">
                <p><strong>Événement :</strong> ${ticketTypeData.events.title}</p>
                <p><strong>Date :</strong> ${new Date(ticketTypeData.events.date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Lieu :</strong> ${ticketTypeData.events.location}</p>
                <p><strong>Type :</strong> ${ticketTypeData.name}</p>
              </div>

              <p style="margin-top: 30px; font-size: 12px; color: rgba(255,255,255,0.4);">
                Présentez ce QR Code à l'entrée de l'événement.
              </p>
            </div>
          `,
        }),
      })

      if (emailResponse.ok) {
        console.log(`✅ Email envoyé avec succès à ${customerEmail}`)
      } else {
        const error = await emailResponse.json()
        console.error("❌ Erreur Resend:", error)
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error(`❌ Erreur: ${err.message}`)
    return new Response(`Erreur: ${err.message}`, { status: 400 })
  }
})
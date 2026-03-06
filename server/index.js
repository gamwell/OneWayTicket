require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend'); // ✅ Import Resend

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY); // ✅ Initialisation

// --- CONFIGURATION URLS INTELLIGENTE ---
// 1. Priorité à la variable CLIENT_URL du fichier .env (si elle existe)
// 2. Sinon, si on est en Production (Vercel), on utilise votre domaine
// 3. Sinon (par défaut), on utilise localhost pour vos tests
const CLIENT_URL = process.env.CLIENT_URL 
  || (process.env.NODE_ENV === 'production' ? 'https://quarksydigital.com' : 'http://localhost:5173');

console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'} | Redirections Stripe vers: ${CLIENT_URL}`);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://quarksydigital.com',
    'https://www.quarksydigital.com'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.get('/', (req, res) => res.send('API OneWayTicket (Resend) en ligne 🚀'));

// --- ROUTE PAIEMENT STRIPE ---
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { event, email } = req.body;
    let finalAmount = 2900; 
    
    // Calcul de sécurité du prix
    if (event && event.price) {
        const cleanPrice = event.price.toString().replace(/[^0-9]/g, '');
        const parsed = parseInt(cleanPrice);
        if (!isNaN(parsed) && parsed > 0) finalAmount = parsed < 1000 ? parsed * 100 : parsed;
    }

    // 1. Création ou récupération du Client Stripe (Obligatoire V2)
    const customer = await stripe.customers.create({
      email: email || 'client@quarksydigital.com',
      name: 'Client OneWayTicket',
    });

    // 2. Création de la session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customer.id, // Liaison client
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: event?.title || "Billet Événement" },
          unit_amount: finalAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      invoice_creation: { enabled: true },
      
      // ✅ Utilisation de l'URL intelligente définie plus haut
      success_url: `${CLIENT_URL}/success`,
      cancel_url: `${CLIENT_URL}/cart`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Erreur Stripe:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- 🔥 ROUTE ENVOI BILLET (VIA RESEND) ---
app.post('/send-ticket-email', async (req, res) => {
  const { email, ticketId, eventName, userName } = req.body;
  console.log(`📧 Envoi via Resend à ${email}...`);

  try {
    const data = await resend.emails.send({
      // ⚠️ Cette adresse doit être un domaine vérifié sur Resend
      from: 'Billetterie OneWay <admin@quarksydigital.com>', 
      to: [email],
      subject: `Votre Billet : ${eventName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6d28d9;">Confirmation de commande</h2>
          <p>Bonjour <strong>${userName}</strong>,</p>
          <p>Voici votre billet confirmé pour <strong>${eventName}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;">
             <p style="margin: 0; font-size: 14px; color: #555;">ID UNIQUE</p>
             <span style="font-size: 20px; font-weight: bold; letter-spacing: 1px;">${ticketId}</span>
          </div>

          <p style="font-size: 12px; color: #888; text-align: center;">
            Envoyé par QuarksyDigital.<br/>
            En cas de problème : <a href="mailto:support@quarksydigital.com">support@quarksydigital.com</a>
          </p>
        </div>
      `,
    });

    console.log("✅ Email envoyé, ID Resend:", data.id);
    res.json({ success: true, id: data.id });
  } catch (error) {
    console.error("❌ Erreur Resend:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`📡 Backend (Resend) actif sur le port ${PORT}`));